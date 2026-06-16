import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from './user.model';
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