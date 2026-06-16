import { Schema, model, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';


// --- ENUMS ---

export enum UserRole {
  USER    = 'user',
  ADMIN   = 'admin',
  PREMIUM = 'premium',
}

export enum UserStatus {
  PENDING = 'pendiente',
  ACTIVE  = 'activo',
  BANNED  = 'baneado',
}


// --- INTERFACES ---

export interface IShippingAddress {
  calle:           string;
  ciudad:          string;
  provincia:       string;
  codigoPostal:    string;
  pais:            string;
  esPredeterminada: boolean;
}

export interface IUserProfile {
  firstName:  string;
  lastName:   string;
  phone?:     string;
  avatarUrl?: string;
  addresses:  IShippingAddress[];
}

export interface IUser {
  username: string;
  email:    string;
  password?: string; // opcional para no exponer el hash al convertir a JSON
  role:     UserRole;
  status:   UserStatus;
  profile:  IUserProfile;
  metadata: {
    lastLogin?:    Date;
    emailVerified: boolean;
  };
}

export type UserDocument = HydratedDocument<IUser>;


// --- SUBESQUEMAS ---

const DireccionEnvioSchema = new Schema<IShippingAddress>({
  calle:            { type: String, required: true, trim: true },
  ciudad:           { type: String, required: true, trim: true },
  provincia:        { type: String, required: true, trim: true },
  codigoPostal:     { type: String, required: true, trim: true },
  pais:             { type: String, required: true, trim: true },
  esPredeterminada: { type: Boolean, default: false },
}, { _id: true }); // _id: true para poder actualizar o borrar una dirección concreta

const UserProfileSchema = new Schema<IUserProfile>({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  phone:     { type: String, trim: true },
  avatarUrl: { type: String, default: 'https://placehold.co/150' },
  addresses: [DireccionEnvioSchema],
}, { _id: false });


// --- ESQUEMA PRINCIPAL ---

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'El nombre de usuario es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'El username debe tener al menos 3 caracteres'],
  },
  email: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Introduce un correo válido'],
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
  },
  role:   { type: String, enum: Object.values(UserRole),   default: UserRole.USER },
  status: { type: String, enum: Object.values(UserStatus), default: UserStatus.PENDING },
  profile: { type: UserProfileSchema, required: true },
  metadata: {
    lastLogin:     { type: Date },
    emailVerified: { type: Boolean, default: false },
  },
}, { timestamps: true, versionKey: false });


// --- HOOKS ---

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password;
    return ret;
  },
});


// --- MODELO ---

export const User = model<IUser>('User', userSchema);
