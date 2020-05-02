import { Express } from 'express'
import  {userController}  from '../controllers';
import * as passport from 'passport';
import auth from '../classes/common/Auth';
import GlobObjs from '../classes/common/GlobObjs';


export default class PublicRoutes {
  constructor(app: Express) {
      app.route('/api/*').all(auth.optional, (err, req, res, next) => {
            if (err) {
              // console.log(err);
              res.status(err.status).json({error: err});
              return ;
            }
            next();
      });
      app.route('/api/user/register').post(userController.user);
      app.route('/api/session/login').post((req, res, next) => {
          return passport.authenticate('local', { session: true }, (err, passportUser) => {
          console.log('Back from Passportcheck', err, passportUser);
          if (err) {
            return res.status(500).json({...err, ok: false});
          }
          if (passportUser) {
            const user = passportUser;
          //  user.token = passportUser.generateJWT();
            const glob = new GlobObjs();
            glob.set('me', user);
            // req.session.me2 = user;
            let expUser = user.toAuthJSON();
            user.setActiveToken(expUser.token);
            return res.json({ user: expUser, ok: true });
          }
          // return info;
        })(req, res, next);
      });
  }
}
