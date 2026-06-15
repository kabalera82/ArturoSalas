import jwt from 'jsonwebtoken';

// ------------ TIPOS ------------------------------------------------------

// payload que viaja dentro del JWT y queda en req.user tras verificar el token
export interface TokenPayload {
  id:       string;
  username: string;
  rol:      string;
}

// extendemos Request de Express para que req.user esté disponible en todos los controladores
// va aquí porque TokenPayload es exactamente el tipo de req.user — mismo archivo, sin carpetas extra
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// ------------ FIRMAR TOKEN -----------------------------------------------

export const generateToken = (payload: TokenPayload): string =>
  jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' });

// ------------ VERIFICAR TOKEN --------------------------------------------

export const verifyToken = (token: string): TokenPayload =>
  jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
