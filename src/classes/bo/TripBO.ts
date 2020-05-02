import GlobObjs from '../common/GlobObjs'
import {TripModel, LocationModel, GenUserInter} from '../../models';
import UserBO from './UserBO';
import Tools from '../common/Tools'
import  locConf from '../common/AlapaConfig'
import * as _ from 'lodash';
import * as mom from 'moment';

class TripBO {
    private currUser: GenUserInter;
    private sess: GlobObjs;
    private logger;
    private tools: Tools;
    private userBo: UserBO;
    constructor() {
        this.sess = new GlobObjs();
        this.logger = this.sess.getLogger();
        this.currUser = <GenUserInter> _.pick(this.sess.get('me'), ['_id', 'userid', 'fullName']);
        this.logger.info('TripBO init:.');
        this.tools = new Tools();
        this.userBo = new UserBO();
    }
    /**
     * @param trip: <TripModel>Object
     * @param callback: Function: Returns Boolean
     */
    public addTrip(trip: any, callback: Function): void {
        if (!this.currUser._id)
           return callback({ok: false, error:{code: 'not_session_usr', msg: 'No Session Started'}});
        trip = _.extend(trip, {driver: this.currUser});
        let tripMObj = new TripModel(trip);
        tripMObj.save((err, trp) => {
            if (err) {
                return callback({ok: false, err: err});
            }
            return callback({ok: true, trip: trp});
        });
       // callback({ok: true, msg: 'TODO: Implement Fnc addTrip ', params: {trip: trip}});
    }// Boolean;

    /**
     * @param filters: Object
     * @param callback: Function: Return <LocationModel>Array
     * @TODO Apply proper filters
     */
    public getLocations(filters: any, callback: Function): void {
        let custFil = {};
        if (filters && filters.keyword) {
            custFil = {$or: [
                              { 'city': new RegExp(filters.keyword, 'ig') },
                              { 'country': new RegExp(filters.keyword, 'ig') },
                              { 'tags': filters.keyword },
                            ]}
        }
        if (filters.country)
            custFil = _.extend(custFil, {country : filters.country});
        if (filters.nearOf) {
            custFil = _.extend(custFil, { 'coords': { $near: {
                                                                $geometry: {type: 'Point', coordinates: filters.nearOf, },
                                                                $maxDistance: locConf.gpsRatio,
                                                              },
                                                    },
                             });
        }
        console.log(custFil);
        LocationModel.find(custFil)
        .sort({city: 'asc'})
        .limit(30)
        .then(docs => {
            return callback({ok: true, items: docs});
        })
        .catch(err => {
            return callback({ok: false, error: err });
        });
        // callback
        // callback({ok: true, msg: 'TODO: Implement Fnc getLocations', params: {filters: filters}});
    }// Array<Location>;
    /**
     * @param location: <LocationModel>Object
     * @param callback: Function: Return Boolean
     */
    public addLocation(location: Object, callback: Function): void {
        let modObj = new LocationModel(location);
        modObj.save((err, objBack) => {
            if (err) {
                callback({ok: false, err: err});
            }
            callback({ok: true, location: objBack});
        });
       // callback({ok: true, msg: 'TODO: Implement Fnc addLocation', params: {location: location}});
    }// Boolean;

    /**
     * @param filters: Object
     * @param callback: Function: Return <TripModel>Array
     * @TODO Apply proper filters
     */
    public searchTrips(filtersSrv: any, callback: Function): void {
        const meObj = this;
        console.log('filtersSrv: ', filtersSrv);
        if (!this.currUser._id)
           return callback({ok: false, error: {code: 'not_session_usr', msg: 'No Session Started'}});
        let filters = {};
        if (filtersSrv.gpsOrigin) {
            filtersSrv.gpsOrigin = JSON.parse(filtersSrv.gpsOrigin);
            console.log(filtersSrv.gpsOrigin);
            filters = { departureCoords: { $near: {
                                                $geometry: { type: 'Point', coordinates: filtersSrv.gpsOrigin, },
                                                $maxDistance: locConf.gpsRatio,
                                            },
                                          },
                       };
        }
        if (filtersSrv.gpsDestiny) {
            filtersSrv.gpsDestiny = JSON.parse(filtersSrv.gpsDestiny);
            filters = _.extend(filters, { 'destiny.coords': { $near: {
                                                                $geometry: {type: 'Point', coordinates: filtersSrv.gpsDestiny, },
                                                                $maxDistance: locConf.gpsRatio,
                                                               },
                                                            },
                                        });
        }
        if (filtersSrv.keyword) {
            filters = _.extend(filters, {$or: [{ 'destiny.city': new RegExp(filtersSrv.keyword, 'ig') },
                                               { 'driver.userid': new RegExp(filtersSrv.keyword, 'ig') },
                                               { 'driver.fullName': new RegExp(filtersSrv.keyword, 'ig') }],
                                        });
        }
        if (filtersSrv.date) {
            let fromD = mom(filtersSrv.date, 'MM.DD.YYYY hh:mm a').startOf('day');
            let toD = mom(filtersSrv.date, 'MM.DD.YYYY hh:mm a').endOf('day');
            filters = _.extend(filters, {departureDate: {$gte: fromD.toDate(), $lte: toD.toDate()}});
        }
        // At this point... All filters prefilled
        // In case no filters, then return empty results
        console.log(filters);
        if (_.isEmpty(filters)) {
            return callback({ok: false, error: {msg: 'At least one filter needs to be added'}});
        }
        let userMe = this.currUser;
        filters = _.extend(filters, {'driver._id': {$not: {$eq: userMe._id}, },
                                     requestOpen: true,
                                    });

        TripModel.find(filters, (err, docs) => {
            if (err)
                return callback({ok: false, error: err });
            return callback({ok: true, items: docs});
        })
        .sort({departureDate: 'asc'});
        // callback({ok: true, msg: 'TODO: Implement Fnc searchTrips', params: {filters: filters}});
    }// Array<Trip>

    /**
     * @param passenger: <UserModel>Object
     * @param trip: <TripModel>Object
     * @param callback: Function: Return Boolean
     */
    public raiseTripRequest(trip: any, callback: Function): void {
        if (!this.currUser._id)
           return callback({ok: false, error:{code: 'not_session_usr', msg: 'No Session Started'}});
        let userMe = this.currUser;
        TripModel.findById(trip._id, (err, tripDoc) => {
            if (err)
                    return callback({ok: false, error: err });
            if (!tripDoc.requestOpen || ['finished'].indexOf(tripDoc.state) > -1)
                    return callback({ok: false, error: {code: 'no_request_accepted',
                                                        msg: `Trip on ${tripDoc.state}, not accepting requests or trip already ended`}});
            tripDoc.tripRequesters.push(userMe);
            tripDoc.tripRequesters = <[GenUserInter]> _.uniqBy(tripDoc.tripRequesters, '_id');
            tripDoc.save(err => {
                if (err) {
                    return callback({ok: false, error: err});
                }
                return callback({ok: true});
            });
        });
        // callback({ok: true, msg: 'TODO: Implement Fnc raiseTripRequest', params: {trip: trip, passenger: passenger}});
    }// Boolean

    /**
     * @param filters: Object
     * @param callback: Function: Return <TripModel>Array
     */
    public seeMyTrips(filters: Object, callback: Function): void {
        if (!this.currUser._id)
           return callback({ok: false, error:{code: 'not_session_usr', msg: 'No Session Started'}});
        let userMe = this.currUser;
        TripModel.find({'driver._id' : userMe._id}, (err, docs) => {
            if (err)
                return callback({ok: false, error: err });
            return callback({ok: true, items: docs});
        }).sort({departureDate: 'asc'});
        // callback({ok: true, msg: 'TODO: Implement Fnc seeMyTrips', params: {filters: filters}});
    }// Array<Trip>;


    /**
     * @param trip: <TripModel>Object
     * @param callback: Function: Return <UserModel>Array of requesters
     */
    public seeTripRequestsToMe(trip: any, callback: Function): void {
        if (!this.currUser._id)
           return callback({ok: false, error: {code: 'not_session_usr', msg: 'No Session Started'}});
        const userMeId = this.currUser._id;
        TripModel.find({'driver._id': userMeId, _id: trip._id})
        .sort({departureDate: 'asc'})
        .then(docs => {
            let finItems = _.map(docs, _node => {
                let finRes: any = <any> JSON.parse(JSON.stringify(_node));
                finRes.requestStatus = (_.find(_node.passengers, {_id: userMeId})) ? 'accepted' : 'pending';
                if (_node.availableSeats <= _node.passengers.length && finRes.requestStatus === 'pending')
                      finRes.requestStatus = 'no_room';
                return _.omit(finRes, ['passengers', 'tripRequesters']);
            });
            return callback({ok: true, items: finItems});
        })
        .catch(err => {
            return callback({ok: false, error: err });
        })
        // callback({ok: true, msg: 'TODO: Implement Fnc seeMyTripRequests', params: {trip: trip}});
    }// Array<TripRequest>;

    /**
     * @param callback: Function: Return <UserModel>Array of requesters
     */
    public getMyTripRequest(callback: Function): void {
        if (!this.currUser._id)
           return callback({ok: false, error:{code: 'not_session_usr', msg: 'No Session Started'}});
        const userMeId = this.currUser._id;
        TripModel.find({'tripRequesters._id': userMeId})
        .sort({departureDate: 'asc'})
        .then(docs => {
            let finItems = _.map(docs, _node => {
                let finRes: any = <any> JSON.parse(JSON.stringify(_node));
                finRes.requestStatus = (_.find(_node.passengers, {_id: userMeId})) ? 'accepted' : 'pending';
                if (_node.availableSeats <= _node.passengers.length && finRes.requestStatus === 'pending')
                      finRes.requestStatus = 'no_room';
                return _.omit(finRes, ['passengers', 'tripRequesters']);
            });
            return callback({ok: true, items: finItems});
        })
        .catch(err => {
            return callback({ok: false, error: err });
        })
        // callback({ok: true, msg: 'TODO: Implement Fnc getTripsIhaveRequested'});
    }// Array<TripRequest>;

    /**
     * @param trip: <TripModel>Object
     * @param callback: Function Return Boolean
     */
    public startTrip(props: any, callback: Function): void {
        let {tripId, requestOpen} = props;
        if (!tripId)
            return callback({ok: false, error: {msg: 'No trip ID Sent'} });
        requestOpen = requestOpen || false;
        TripModel.findById(tripId, (err, doc) => {
            if (err)
                return callback({ok: false, error: err });
            if (!this.isMyTrip(doc)) {
                return callback({ok: false, error: {msg: 'I can only update this feature to my trips'} });
            }
            doc.requestOpen = requestOpen;
            doc.state = 'started';
            doc.save((err, objBack) => {
                if (err) {
                    callback({ok: false, err: err});
                }
                /**
                 * @todo: Raise Notification to Users and observers
                 */
                callback({ok: true, item: objBack});
            });
        });
        // callback({ok: true, msg: 'TODO: Implement Fnc startTrip', params: {trip: trip}});
    }// Boolean;

    /**
     * @param trip: <TripModel>Object
     * @param callback: Function: Return Boolean
     */
    public endTrip(props: any, callback: Function): void {
        let {tripId} = props;
        if (!tripId)
            return callback({ok: false, error: {msg: 'No trip ID Sent'} });
        TripModel.findById(tripId, (err, doc) => {
            if (err)
                return callback({ok: false, error: err });
            if (!this.isMyTrip(doc)) {
                    return callback({ok: false, error: {msg: 'I can only update this feature to my trips'} });
            }
            doc.requestOpen = false;
            doc.state = 'finished';
            doc.save((err, objBack) => {
                if (err) {
                    callback({ok: false, err: err});
                }
                /**
                 * @todo: Raise Notification to Users
                 * @todo: Calculate and create invoice 
                 */
                callback({ok: true, item: objBack});
            });
        });
        // callback({ok: true, msg: 'TODO: Implement Fnc endTrip', params: {trip: trip}});
    }// Boolean;

    /**
     * @param tripRequester: <UserModel>Object
     * @param trip: <TripModel>Object
     * @param callback: Function: Return Boolean
     */
    public approveTripRequest(props: any, callback: Function): void {
        let {tripRequester, trip} = props;
        if (!trip || !trip._id)
            return callback({ok: false, error: {msg: 'No trip ID Sent'} });
        if (!tripRequester)
            return callback({ok: false, error: {msg: 'Not Requester Sent'} });
        TripModel.findById(trip._id, (err, doc) => {
            if (err)
                return callback({ok: false, error: err });
            if (!this.isMyTrip(doc)) {
                    return callback({ok: false, error: {msg: 'I can only update this feature to my trips'} });
            }
            doc.passengers.push(tripRequester);
            doc.passengers = <[GenUserInter]> _.uniqBy(doc.passengers, '_id');
            doc.save((err, objBack) => {
                if (err) {
                    callback({ok: false, err: err});
                }
                /**
                 * @todo: Raise Notification to User
                 */

                callback({ok: true, item: objBack});
            });
        });
        //callback({ok: true, msg: 'TODO: Implement Fnc approveTripRequest', params: {trip: trip, tripRequester: tripRequester}});
    }// Boolean;

    /**
     * @param tripRequester: <UserModel>Object
     * @param trip: <TripModel>Object
     * @param callback: Function: Return Boolean
     */
    public rejectTripRequest(props: any, callback: Function): void {
        let {tripRequester, trip} = props;
        if (!trip || !trip._id)
            return callback({ok: false, error: {msg: 'No trip ID Sent'} });
        if (!tripRequester)
            return callback({ok: false, error: {msg: 'Not Requester Sent'} });
        TripModel.findById(trip._id, (err, doc) => {
            if (err)
                return callback({ok: false, error: err });
            if (!this.isMyTrip(doc)) {
                    return callback({ok: false, error: {msg: 'I can only update this feature to my trips'} });
            }
           // doc.passengers.push(tripRequester);
            doc.passengers = <[GenUserInter]> _.remove(doc.passengers, {_id: tripRequester._id});
            doc.tripRequesters = <[GenUserInter]> _.remove(doc.tripRequesters, {_id: tripRequester._id});
            doc.save((err, objBack) => {
                if (err) {
                    callback({ok: false, err: err});
                }
                /**
                 * @todo: Raise Notification to User
                 */

                callback({ok: true, item: objBack});
            });
        });
        // callback({ok: true, msg: 'TODO: Implement Fnc rejectTripRequest', params: {trip: trip, tripRequester: tripRequester}});
    }// Boolean;

    /**
     * @param driver: <UserModel>Object
     * @param trip: <TripModel>Object
     * @param callback: Function Return <InvoiceTrip>Object
     */
    private closeAndInvoiceTrip(driver: Object, trip: Object, callback: Function): void {
        callback({ok: true, msg: 'TODO: Implement Fnc closeAndInvoiceTrip'});
    }// InvoiceTrip;

    /**
     * @param trip: <TripModel>any
     */
    private isMyTrip(props: any): Boolean {
        const userMeId = this.currUser._id;
        let {trip} = props;
        return (trip.driver._id === userMeId);
    }
}

export default TripBO;
