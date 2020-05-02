import { model, Schema, connection, Document } from 'mongoose';
import * as moment from 'moment';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';


interface UserInter extends Document {
    userid: string,
  //  password: String,
    activeToken: string,
    avatarImg: string,
    displayName: string,
    fullName: string,
    findmeActive: boolean,
    observers: [{ _id: Schema.Types.ObjectId,
                  userid: string,
                  fullName: string,
              }],
    email: string,
    paymentMethod: {pmType: string, enum: ['cash', 'paypal', 'cc'],
                    pmVals: {},
                   },
    hash: string,
    salt: string,
    switchAndsave(callback): void,
    setPassword(password): void,
    setActiveToken(token): void,
    validatePassword(password): Boolean,
    generateJWT(): Object,
    toAuthJSON(): Object, 
}

let UserSchema = new Schema({
    userid: {
      type: Schema.Types.String,
      required: true,
      lowercase: true,
      index: {unique: true},
    },
    activeToken: {type: String, required: true, default: ''},
    displayName: {type: String},
    fullName: {type: String},
    avatarImg: {type: String},
    findmeActive: {type: Boolean, default: false},
    observers: [{ _id: {type: Schema.Types.ObjectId},
                  userid: {type: String},
                  fullName: {type: String},
               }],
    email: {type: String,
        required: true,
        index: {unique: true},
        lowercase: true,
    },
    paymentMethod: {
      pmType: {type: String, default: 'cash', enum: ['cash', 'paypal', 'cc']},
      pmVals: {type: Schema.Types.Mixed},
    },
    hash: {type: String},
    salt: {type: String},
  });

UserSchema.methods.switchAndsave = (callback) => {
     connection.useDb('BluezincGlobal');
     this.save(err => {
        callback(err);
     });
     connection.useDb('alapa');
};

UserSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.setActiveToken = function(token) {
  this.activeToken = token;
  this.save();
};

UserSchema.methods.validatePassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {
    const today = moment();
   // const expirationDate = today.add(60, 's');
    return jwt.sign({
      _id: this._id,
      email: this.email,
      // exp: Math.floor(Date.now() / 1000) + (60 * 60 * 10), //expirationDate.format('x'),
    }, 'secret');
  }

UserSchema.methods.toAuthJSON = function() {
    return {
      _id: this._id,
      userid: this.userid,
      fullName: this.fullName,
      email: this.email,
      avatarImg: this.avatarImg,
      token: this.generateJWT(),
    };
  };

export default model<UserInter>('User', UserSchema);
