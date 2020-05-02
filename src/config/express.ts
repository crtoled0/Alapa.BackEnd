import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as cors from 'cors';
import * as express from 'express'
import * as mongoose from 'mongoose'
import * as session from 'express-session'
import GlobObjs from '../classes/common/GlobObjs'
import passport from  './passport';
// import * as logger from 'morgan'
import * as multer from 'multer';
import logger from './logging';
import * as path from 'path'
import config from './config'

let upload = multer({ dest: '/uploads/' });


export default function() {
  const app: express.Express = express()

  for (const model of config.globFiles(config.models)) {
     require(path.resolve(model))
  }

   // app.set('views', path.join(__dirname, '../../src/views'))
  // app.set('view engine', 'pug');
  // app.set('logger', logger);

  // CORS middleware
  app.use(cors());
  app.options('*', cors());

  /***
    app.use(
      (err: Error, req: express.Request, res: express.Response, next: Function): void => {
      //  const err: Error = new Error('Not Found')
        console.log('Setting CrossDomain Access');
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Origin', 'http://10.0.75.1:19006');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
      },
    );
  **/

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(express.static(path.join(__dirname, '../../src/public')))

  for (const route of config.globFiles(config.routes)) {
    require(path.resolve(route)).default(app)
  }

  if (config.useMongo) {
      // mongoose.connect(config.mongodb, {useNewUrlParser: true}); 
      const MongoStore = require('connect-mongo')(session);
      mongoose.connect(config.mongodb);
      let db = mongoose.connection;
      db.on('error', console.error.bind(console, 'Error connecting to mongo'));
      db.once('open', () => {
        console.log('Connected to Database ', config.mongodb);
        app.use(cookieParser())
        let sess = session({store: new MongoStore({ mongooseConnection: db }),
                            secret: 'superTopSecret',
                            cookie: {secure: true,
                                    maxAge: 2592000000,
                                    },
                            resave: false,
                            saveUninitialized: false,
                              // autoRemove: 'interval',
                              // autoRemoveInterval: 10, // In minutes. Default
                            });
        app.use(sess);
        app.set('globVars', new GlobObjs(sess, logger));
      });
  }
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(
    (err: Error, req: express.Request, res: express.Response, next: Function): void => {
    //  const err: Error = new Error('Not Found')
      console.log('Something went wrong');
      res.status(500).json({ok: false, error: err});
      next();
    },
  );
  return app
}
