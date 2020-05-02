import GlobObjs from '../classes/common/GlobObjs';
import * as formidable from 'formidable';

//import auth  from '../classes/common/Auth';

class MainController {
   protected setSession(req): void {
    let { headers: { authorization } } = req;
    let token = (authorization && authorization.split(' ')[0] === 'Token')? authorization.split(' ')[1]:null;
    if (token) {
        const glob = new GlobObjs();
        glob.set('token', token);
       // let usr = auth.decodeUser(token);
       // glob.set('me', usr);
    }
   }

   protected checkUploadedFiles(req, callback: Function): void {
      let form = new formidable.IncomingForm(); //Receive form
      form.parse(req, function(err, fields, files) {
         // Do form stuff, you can access the files
         console.log(err, fields, files);
         callback(err, fields, files);
      });
   }
}
export default MainController;
