import { Request, Response } from 'express';

class MiscController {
  
  public miscmsg(req: Request, res: Response): void {
    req.app.get('logger').info('Log from miscmsg');
    res.json({ msg: 'Hello Misc!', method: req.method })
  }

  public miscmsg2(req: Request, res: Response): void {
    req.app.get('logger').info('Log from miscmsg2');
    res.json({ msg: 'Hello Again Misc!', method: req.method })
  }
}

export default new MiscController();
