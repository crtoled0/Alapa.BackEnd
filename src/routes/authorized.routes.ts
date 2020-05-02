import { Express } from 'express'
import  {tripController, userController}  from '../controllers';
import auth from '../classes/common/Auth';
import GlobObjs from '../classes/common/GlobObjs';


export default class AuthorizedRoutes {
  constructor(app: Express) {
      app.route('/api/adm/*').all(auth.required, (err, req, res, next) => {
          if (err) {
           // console.log(err);
            res.status(err.status).json({ok: false, error: err});
            return ;
          }
          next();
      });
      // Trip Routes
      app.route('/api/adm/trip').post(tripController.trip);
      app.route('/api/adm/trip/start|end').put(tripController.trip);
      app.route('/api/adm/my/trips').get(tripController.trip);
      app.route('/api/adm/trips/search').get(tripController.trip);
      app.route('/api/adm/trip-request/mine|tome').get(tripController.tripRequest);
      app.route('/api/adm/trip-request/add|approve|reject').put(tripController.tripRequest);
      app.route('/api/adm/location').get(tripController.location)
                                    .post(tripController.location);
      // User Routes
      app.route('/api/adm/user/update|findme-mode-switch|setmygps|notification').put(userController.user);
      app.route('/api/adm/user/updateImg').post(userController.user);
      app.route('/api/adm/profile|profiles-summary|where').get(userController.user);
      app.route('/api/adm/session/refresh').post(userController.session);
      app.route('/api/adm/feedback').post(userController.feedback);
      app.route('/api/adm/observer').post(userController.observer)
                                    .delete(userController.observer);
      app.route('/api/adm/observer/my|myusers').get(userController.observer);
      app.route('/api/session/refresh').post(userController.session);

      app._router.stack.forEach(function(r){
        if (r.route && r.route.path) {
          console.log(r.route.path, r.route.methods);
        }
      });
  }
}
