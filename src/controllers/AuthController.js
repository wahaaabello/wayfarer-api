import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SQLErrorCodes } from '../helpers';
import User from '../models/User';

export default class AuthController {
  static async signUp(req, res, next) {
    const {
      first_name, last_name, password, email,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    let user;
    try {
      user = await User.create({
        first_name,
        last_name,
        password: hashedPassword,
        email,
      });
    } catch (err) {
      // Check if error is due to integrity constraint violation
      if (err.code.substring(0, 2) === '23') {
        const resErr = {};
        switch (err.code) {
          case SQLErrorCodes.not_null_violation.code:
            resErr.status = SQLErrorCodes.unique_violation.name;
            resErr.error = err.detail;
            break;
          case SQLErrorCodes.unique_violation.code:
            resErr.status = SQLErrorCodes.unique_violation.name;
            resErr.error = err.detail;
            break;
          default:
            return next(err);
        }
        return res.status(400)
          .json(resErr);
      }
      return next(err);
    }
    const { id, is_admin } = user;
    const token = jwt.sign({ user_id: id }, process.env.JWT_SECRET);
    return res.status(201)
      .json({
        status: 'success',
        data: {
          user_id: id,
          token,
          is_admin,
        },
      });
  }

  static async signIn(req, res) {
    const {
      password, email,
    } = req.body;
    const record = await User.findOne('email', email);
    if (!record) {
      return res.status(401)
        .json({
          status: 'error',
          error: 'Email account not found',
        });
    }
    const { password: hashedPassword, id, is_admin } = record;
    const isSame = await bcrypt.compare(password, hashedPassword);
    if (!isSame) {
      return res.status(401)
        .json({
          status: 'error',
          error: 'Password is invalid',
        });
    }
    const token = jwt.sign({ user_id: id }, process.env.JWT_SECRET);
    return res.status(200)
      .json({
        status: 'success',
        data: {
          user_id: id,
          token,
          is_admin,
        },
      });
  }
}
