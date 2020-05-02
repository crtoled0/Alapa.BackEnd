import { Request, Response } from 'express';
import TripBO from '../classes/bo/TripBO';
import MainController from './MainController';

class TripController extends MainController {

  public trip(req: Request, res: Response): void {
      super.setSession(req);
      const tripObj = new TripBO();
      console.log('base URL', req.originalUrl);
      if (req.method === 'POST') {
            tripObj.addTrip(req.body,
                            (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
      } else if (req.method === 'PUT') {
            if (/\/start/ig.test(req.originalUrl)) {
                tripObj.startTrip(req.body, (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
            } else if (/\/end/ig.test(req.originalUrl)) {
                tripObj.endTrip(req.body, (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
            } else
                res.status(400).json({ok: false, msg: 'Bad PUT Request'});
      } else if (req.method === 'GET') {
          console.log(req.query);
          if (/\/my\/trips/ig.test(req.originalUrl)) {
            tripObj.seeMyTrips(req.query,
                              (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
          } else if (/\/search/ig.test(req.originalUrl)) {
            tripObj.searchTrips(req.query,
                (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
          } else
          res.status(400).json({ok: false, msg: 'Bad GET Request'});
      }
  }

  public tripRequest(req: Request, res: Response): void {
    super.setSession(req);
    const tripObj = new TripBO();
    console.log(req.originalUrl);
    if (req.method === 'PUT') {
        if (/\/add/ig.test(req.originalUrl)) {
            tripObj.raiseTripRequest(req.body.trip,
                                    (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
        } else if (/\/approve/ig.test(req.originalUrl)) {
            tripObj.approveTripRequest(req.body,
                                      (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
        } else if (/\/reject/ig.test(req.originalUrl)) {
            tripObj.rejectTripRequest(req.body,
                                     (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
        } else
            res.status(400).json({ok: false, msg: 'Bad Request'});
    } else if (req.method === 'GET') {
        console.log(req.query);
        if (/\/tome/ig.test(req.originalUrl)) {
            tripObj.seeTripRequestsToMe(req.query,
                                    (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
        } else if (/\/mine/ig.test(req.originalUrl)) {
            tripObj.getMyTripRequest((_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
        }
    }
  }

  public location(req: Request, res: Response): void {
        super.setSession(req);
        const tripObj = new TripBO();
        console.log(req.originalUrl);
        if (req.method === 'POST') {
               tripObj.addLocation(req.body,
                                  (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
        } else if (req.method === 'GET') {
            console.log(req.query);
            tripObj.getLocations(req.query,
                (_res: any) => (_res.ok ? res.json(_res) : res.status(_res.status || 500).json(_res)));
        }
  }
}

export default new TripController();
