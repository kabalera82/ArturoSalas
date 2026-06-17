export interface Usuario {
  id: string;
  username: string;
  role: string;
  status: string;
}

export interface RespuestaLogin {
  token: string;
  user:  Usuario;
}
