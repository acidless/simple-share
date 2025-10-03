import jwt, {SignOptions} from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export function jwtSign(payload: object, expiresIn: SignOptions["expiresIn"] = '1d') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function jwtVerify(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
}