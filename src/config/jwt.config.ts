export default {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '1h',
};

export interface JwtPayload {
  username: string;
  id: number;
  roleId: number;
}
