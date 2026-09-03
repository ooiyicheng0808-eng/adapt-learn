import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      console.error("CRITICAL REGISTER ERROR:", error);
      if (error.message === "Email already in use") {
        res.status(409).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: error.message || "Registration failed", error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === "Invalid credentials") {
        res.status(401).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: "Login failed", error: error.message });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);
      res.status(200).json({ message: "Password reset email sent" });
    } catch (error: any) {
      if (error.message === "User not found") {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: "Failed to process request", error: error.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      await AuthService.resetPassword(token, newPassword);
      res.status(200).json({ message: "Password reset successful" });
    } catch (error: any) {
      if (error.message === "Invalid or expired password reset token") {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: "Failed to reset password", error: error.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      
      const { profilePic } = req.body;
      const result = await AuthService.updateProfile(userId, { profilePic });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
  }
}
