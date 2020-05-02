import { Request, Response } from 'express';
import MainController from './MainController';
import UserBO from '../classes/bo/UserBO';

class UserController extends MainController {

  public user(req: Request, res: Response): void {
      super.setSession(req);
      const userObj = new UserBO();
      if (req.method === 'POST') {
        if (/\/updateImg/ig.test(req.originalUrl)) {
            super.checkUploadedFiles(req, (err, fields, files) => {
                userObj.updateUser({fields, files}, (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
            });
        } else if (/\/register/ig.test(req.originalUrl)) {
            userObj.registerUser(req.body, (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
        }
      } else if (req.method === 'PUT') {
        if (/\/update/ig.test(req.originalUrl)) {
              userObj.updateUser(req.body, (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
        } else if (/\/findme-mode-switch/ig.test(req.originalUrl)) {
            userObj.toogleFindMeMode((_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
        } else if (/\/setmygps/ig.test(req.originalUrl)) {
            userObj.refreshMyGPSCoord(req.body, (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
        } else if (/\/notification/ig.test(req.originalUrl)) {
            userObj.raiseNotification(req.body,
                                     (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
        }
      } else if (req.method === 'GET') {
          if (/\/profile/ig.test(req.originalUrl)) {
            userObj.getProfile(req.query, (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
          } else if (/\/profiles-summary/ig.test(req.originalUrl)) {
            userObj.getProfilesSummary(req.query.userIds, 
                                      (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
          } else if (/\/where/ig.test(req.originalUrl)) {
            userObj.checkUserPositionInTime(req.query,
                                           (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
          }
      }
  }

  public session(req: Request, res: Response): void {
      super.setSession(req);
      let userObj = new UserBO();
      if (req.method === 'POST') {
          // if (/\/login/ig.test(req.originalUrl)) {
           // userObj.login(req.body, (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
          if (/\/refresh/ig.test(req.originalUrl)) {
           // res.redirect('/api/session/login');
            let { headers: { authorization } } = req;
            let token = (authorization && authorization.split(' ')[0] === 'Token')?authorization.split(' ')[1]:null;
            userObj = new UserBO();
            userObj.refreshSession(token, (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
         }
      }
  }

  public feedback(req: Request, res: Response): void {
    super.setSession(req);
    const userObj = new UserBO();
    if (req.method === 'POST') {
        userObj.addFeedback(req.body, (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
    }
  }

  public observer(req: Request, res: Response): void {
    super.setSession(req);
    const userObj = new UserBO();
    if (req.method === 'POST') {
        userObj.addMeObserver(req.body, (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
    } else if (req.method === 'DELETE') {
        userObj.removeMeObserver(req.body, (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
    } else if (req.method === 'GET') {
        if (/\/my/ig.test(req.originalUrl)) {
            userObj.getMyObservers((_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
        } else if (/\/myusers/ig.test(req.originalUrl)) {
            userObj.getUsersICanObserve((_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
        }
    }
  }
}

export default new UserController();
