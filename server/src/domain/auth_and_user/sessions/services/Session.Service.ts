// src/modules/auth_and_users/session.service.ts

import { DeviceRow } from "@/config/models";
import { NotFoundError, ForbiddenError, UnauthorizedError } from "@/globalError/AppError";
import { TOKENS } from "@/helper/user_and_auth/token";
import { TokenUtil } from "@/utils/jwtTokens";
import { injectable, inject } from "tsyringe";
import type { IDeviceRepository } from "../../Device/repository/IDevice.Repository";
import { SessionResponseDto, SessionListResponseDto, RefreshSessionDto, RefreshTokensResponseDto, RevokeSessionDto } from "../dtos/SessionDto";
import { SessionMapper } from "../mapper/Session.Mapper";
import type { ISessionRepository } from "../repository/ISession.Repository";
import { ISessionService } from "./ISession.Service";
import type { IUserService } from "../../users/services/IUser.Service";
import type { IUserRepository } from "../../users/repository/IUser.Repossitory";


@injectable()
export class SessionService implements ISessionService {

  constructor(
    @inject(TOKENS.SessionRepository) private readonly sessionRepo: ISessionRepository,
    @inject(TOKENS.DeviceRepository)  private readonly deviceRepo:  IDeviceRepository,
    @inject(TOKENS.UserService)       private readonly userRepo:IUserRepository,
  ) {}

  // ── Get session by ID ──────────────────────────────────────────────
  async getSessionById( sessionId:  string,userId: string, currentJti: string): Promise<SessionResponseDto> {
    const session = await this.sessionRepo.findById(sessionId);

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    // Ownership check — user can only view their own sessions
    if (session.userId !== userId) {
      throw new ForbiddenError('You do not have permission to access this session');
    }

    // Fetch device if session has one
    const device = session.hasDevice()
      ? await this.deviceRepo.findById(session.deviceId!)
      : null;

    // Mapper: entity + device → response DTO
    return SessionMapper.toResponseDto(
      session,
      currentJti,
      device ? this.entityToDeviceRow(device) : null,
    );
  }

  // ── Get all active sessions ────────────────────────────────────────
  async getActiveSessions(userId:string, currentJti: string): Promise<SessionListResponseDto> {

    const rows = await this.sessionRepo.findActiveByUserId(userId);

    // Batch fetch all devices — avoids N+1
    const deviceIds = rows
      .map((s) => s.device_id)
      .filter((id): id is string => id !== null);

    const deviceMap = new Map<string, DeviceRow>();

    if (deviceIds.length > 0) {
      // Fetch all devices in parallel
      const devices = await Promise.all(
        deviceIds.map((id) => this.deviceRepo.findById(id)),
      );

      devices.forEach((device) => {
        if (device) {
          deviceMap.set(device.id, this.entityToDeviceRow(device));
        }
      });
    }

    return SessionMapper.toListResponseDto(rows, currentJti, deviceMap);
  }

  // ── Refresh tokens ─────────────────────────────────────────────────
  async refreshTokens(dto: RefreshSessionDto): Promise<RefreshTokensResponseDto> {

    // Step 1 — Verify refresh token signature
    let payload;
    try {
      payload = TokenUtil.verifyRefreshToken(dto.refresh_token);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Step 2 — Hash incoming token to match stored hash
    const tokenHash = TokenUtil.hashToken(dto.refresh_token);

    // Step 3 — Find session by hash
    const session = await this.sessionRepo.findByRefreshTokenHash(tokenHash);

    if (!session) {
      throw new UnauthorizedError('Session not found or already revoked');
    }

    // Step 4 — Validate session
    if (!session.isValid()) {
      // Revoke just in case it's still marked active but expired
      await this.sessionRepo.revoke(session.id);
      throw new UnauthorizedError('Session has expired. Please login again.');
    }

      // Step 4 — Fetch user to get current role
    // Role is NOT stored in refresh token — must fetch fresh
    // This also catches banned/deactivated users at refresh time
    const user = await this.userRepo.findById(payload.sub)
     
     if (!user) {
      throw new UnauthorizedError('User not found');
    }
 
    if (!user.canLogin()) {
      await this.sessionRepo.revoke(session.id);
      throw new UnauthorizedError('Account is not active. Please contact support.');
    }
 
    // Step 5 — Generate new tokens (rotation)
    const { token: newAccessToken, jti: newJti } = TokenUtil.generateAccessToken({
      sub:     payload.sub,
      role:    user.roleName,
      session: session.id,
    });

    const { token: newRefreshToken } = TokenUtil.generateRefreshToken({
      sub:     payload.sub,
      session: session.id,
    });

    // Step 6 — Compute new refresh token expiry (rolling 30 days)
    const newExpiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    );

    const newHash = TokenUtil.hashToken(newRefreshToken);

    // Step 7 — Update session with new tokens atomically
    await Promise.all([
      this.sessionRepo.updateJti(session.id, newJti),
      this.sessionRepo.updateRefreshTokenHash(session.id, newHash, newExpiresAt),
    ]);

    // Step 8 — Map to response
    return SessionMapper.toRefreshResponse(newAccessToken, newRefreshToken);
  }

  // ── Revoke single session ──────────────────────────────────────────
  async revokeSession(dto:RevokeSessionDto,userId: string): Promise<void> {
   
    const session = await this.sessionRepo.findById(dto.session_id);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    // Ownership check
    if (session.userId !== userId) {
      throw new ForbiddenError('You do not have permission to revoke this session');
    }

    // Already revoked — no-op
    if (!session.isActive) return;

    await this.sessionRepo.revoke(dto.session_id);
  }

  // ── Revoke all sessions ────────────────────────────────────────────
  async revokeAllSessions(userId: string): Promise<void> {
    await this.sessionRepo.revokeAllForUser(userId);
  }

  // ── Revoke all except current ──────────────────────────────────────
  async revokeAllExceptCurrent(userId:string,sessionId: string): Promise<void> {
    // Verify current session exists and belongs to user
    const session = await this.sessionRepo.findById(sessionId);

    if (!session || session.userId !== userId) {
      throw new ForbiddenError('Invalid session');
    }

    await this.sessionRepo.revokeAllForUserExcept(userId, sessionId);
  }

  // ── Touch session ──────────────────────────────────────────────────
  async touchSession(sessionId: string,userId:string): Promise<void> {
    const session = await this.sessionRepo.findById(sessionId);

    if (!session || session.userId !== userId) return;
    // Silent failure — touch is a best-effort operation

    // Skip DB write if recently used — reduces unnecessary writes
    if (session.wasRecentlyUsed()) return;

    await this.sessionRepo.updateLastUsed(sessionId);
  }

  // ── Private helper ─────────────────────────────────────────────────
  // Converts DeviceEntity to DeviceRow shape for mapper consumption
  // Avoids importing DeviceEntity in mapper — keeps layers clean
  private entityToDeviceRow(device: any): DeviceRow {
    return {
      id:           device.id,
      user_id:      device.userId,
      device_token: device.deviceToken,
      device_type:  device.deviceType,
      platform:     device.platform,
      device_name:  device.deviceName,
      os_version:   device.osVersion,
      app_version:  device.appVersion,
      is_trusted:   device.isTrusted,
      is_active:    device.isActive,
      last_seen_at: device.lastSeenAt,
      created_at:   device.createdAt,
    };
  }
}