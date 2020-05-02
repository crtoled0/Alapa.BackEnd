import * as passport from 'passport';
import * as LocalStrategy from 'passport-local';

import {UserModel as Users} from '../models';

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, (email, password, done) => {
  console.log('Checking Login', email, password);
  Users.findOne({ email })
    .then((user) => {
      console.log(user);
      if (!user || !user.validatePassword(password)) {
        return done({error: {'email or password': 'is invalid'}}, false);
      }

      return done(null, user);
    }).catch(done);
}));

export default passport;