import * as jwt from 'express-jwt';
import * as jsjwt from 'jsonwebtoken';


const getTokenFromHeaders = (req) => {
  const { headers: { authorization } } = req;
  if (authorization && authorization.split(' ')[0] === 'Token') {
    return authorization.split(' ')[1];
  }
  return null;
};

class Auth {

    private static instance = null;
    public required = jwt({
      secret: 'secret',
      userProperty: 'payload',
      getToken: getTokenFromHeaders,
      });
    public optional = jwt({
      secret: 'secret',
      userProperty: 'payload',
      getToken: getTokenFromHeaders,
      credentialsRequired: false,
      });

    public static getInstance() {
        if (!this.instance)
            this.instance = new Auth();
        return this.instance;
    }
    public decodeUser(token): any{
        return jsjwt.verify(token, 'secret');
     }
}

export default Auth.getInstance();
