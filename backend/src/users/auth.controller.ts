import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, UserStatus } from './user.model';
import { generateToken } from '../shared/token.utils';

// --- REGISTRO ---

// POST /api/auth/register 
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, profile } = req.body;

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      res.status(400).json({ error: 'Usuario o email ya registrado' });
      return;
    }

    const user = await new User({ username, email, password, profile }).save();

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error en el registro', detail: (error as Error).message });
  }
};

// --- LOGIN ---

// POST 
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      return;
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password!);
    if (!valid) {
      res.status(401).json({ error: 'Contraseña incorrecta' });
      return;
    }

    user.metadata.lastLogin = new Date();
    await user.save();

    const token = generateToken({
      id:       user._id.toString(),
      username: user.username,
      rol:      user.role,
    });

    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, role: user.role, status: user.status },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el login', detail: (error as Error).message });
  }
};

// --- AUTH me (yo ahora) ---

export const me = async (req: Request, res: Response) : Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('-password');
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo usuario', detail: (error as Error).message });
  }
};

// --- GET ALL USERS --- 

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    res.status(200).json(users);
    return
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo usuarios', detail: (error as Error).message });
  }
};

// --- DELETE USER ---

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando usuario', detail: (error as Error).message });
  }
};

// --- UPDATE USER ---

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, email, profile, role, status } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { username, email, profile, role, status },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando usuario', detail: (error as Error).message });
  }
};

// --- GET USER BY ID ---

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo usuario', detail: (error as Error).message });
  }
};

// --- UPDATE PASSWORD ---

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Se requieren contraseña actual y nueva' });
      return;
    }

    const user = await User.findById(id).select('+password');
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, user.password!);
    if (!valid) {
      res.status(401).json({ error: 'Contraseña actual incorrecta' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando contraseña', detail: (error as Error).message });
  }
};

// --- ADD ADDRESS ---

export const addAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const address = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { $push: { 'profile.addresses': address } },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error añadiendo dirección', detail: (error as Error).message });
  }
};

// --- REMOVE ADDRESS ---

export const removeAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, addressId } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { $pull: { 'profile.addresses': { _id: addressId } } },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando dirección', detail: (error as Error).message });
  }
};

// --- UPDATE STATUS (admin) ---

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(UserStatus).includes(status)) {
      res.status(400).json({ error: `Estado no válido. Valores permitidos: ${Object.values(UserStatus).join(', ')}` });
      return;
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando estado', detail: (error as Error).message });
  }
};

// --- FORGOT PASSWORD ---

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select('+metadata.resetPasswordToken +metadata.resetPasswordExpires');
    if (!user) {
      res.status(200).json({ message: 'Si el correo existe, recibirás un enlace de recuperación' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.metadata.resetPasswordToken   = token;
    user.metadata.resetPasswordExpires = new Date(Date.now() + 3_600_000); // 1h
    await user.save();

    // TODO: enviar email con el token al usuario
    // await sendEmail(user.email, `Enlace de recuperación: /reset-password?token=${token}`)

    res.status(200).json({ message: 'Si el correo existe, recibirás un enlace de recuperación' });
  } catch (error) {
    res.status(500).json({ error: 'Error procesando solicitud', detail: (error as Error).message });
  }
};

// --- RESET PASSWORD ---

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token y nueva contraseña requeridos' });
      return;
    }

    const user = await User.findOne({
      'metadata.resetPasswordToken':   token,
      'metadata.resetPasswordExpires': { $gt: new Date() },
    }).select('+metadata.resetPasswordToken +metadata.resetPasswordExpires +password');

    if (!user) {
      res.status(400).json({ error: 'Token inválido o expirado' });
      return;
    }

    user.password                        = newPassword;
    user.metadata.resetPasswordToken     = undefined;
    user.metadata.resetPasswordExpires   = undefined;
    await user.save();

    res.status(200).json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error restableciendo contraseña', detail: (error as Error).message });
  }
};