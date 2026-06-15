import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from './user.model';
import { generateToken } from '../shared/token.utils';

// ------------ REGISTER ---------------------------------------------------

// POST /api/auth/register — crea un usuario nuevo
// el hash del password lo hace el hook pre('save') del modelo no aquí
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, profile } = req.body;

    // comprobamos si ya existe un usuario con ese username o email
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      res.status(400).json({ error: 'Usuario o email ya registrado' });
      return;
    }

    // creamos y guardamos el usuario — el hook hasheará el password automáticamente
    const user = await new User({ username, email, password, profile }).save();

    // toJSON del modelo ya elimina el password — no hace falta quitarlo manualmente
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error en el registro', detail: (error as Error).message });
  }
};

// ------------ LOGIN ------------------------------------------------------

// POST /api/auth/login — valida credenciales y devuelve un JWT
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      return;
    }

    // buscamos el usuario incluyendo el password — por defecto toJSON lo oculta
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // comparamos el password recibido con el hash guardado en BD
    const valid = await bcrypt.compare(password, user.password!);
    if (!valid) {
      res.status(401).json({ error: 'Contraseña incorrecta' });
      return;
    }

    // actualizamos la fecha del último login
    user.metadata.lastLogin = new Date();
    await user.save();

    // generamos el JWT con los datos mínimos para identificar al usuario
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

// ------------ ME ---------------------------------------------------------

// GET /api/auth/me — devuelve el usuario completo del token activo
export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user solo tiene el payload del JWT — consultamos el usuario completo en BD
    const user = await User.findById(req.user!.id).select('-password');
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json(user);
  } catch {
    res.status(500).json({ error: 'Error obteniendo usuario' });
  }
};
