import * as mime from 'mime';
import * as fs from 'fs';


class Tools {
    private gpsRatio: number = 0.03;
    public isGPSOnRatio(dotcoors: any, incoords: any): Boolean {
        if (!dotcoors || !dotcoors.lat || !dotcoors.lon || !incoords || !incoords.lat || !incoords.lon)
            return false;
        dotcoors.lat =  Math.abs(dotcoors.lat);
        dotcoors.lon =  Math.abs(dotcoors.lon);
        incoords.lat =  Math.abs(incoords.lat);
        incoords.lon =  Math.abs(incoords.lon);
        if (!(incoords.lat >= dotcoors.lat - this.gpsRatio && incoords.lat >= dotcoors.lat + this.gpsRatio))
            return false;
        if (!(incoords.lon >= dotcoors.lon - this.gpsRatio && incoords.lon >= dotcoors.lon + this.gpsRatio))
            return false;

        console.log(dotcoors, incoords, this.gpsRatio);
        return true;
    }

    public decodeBase64Image(dataString: string): any {
        let matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {type: null, data: null};
        if (matches.length !== 3) {
          return new Error('Invalid input string');
        }
        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');
        return response;
    }

    public uploadImage(data: string): string {
        let uploadPath = '/upload/img';
        let decodedImg = this.decodeBase64Image(data);
        let imageBuffer = decodedImg.data;
        let type = decodedImg.type;
        let extension = 'jpg'; // mime.extension(type);
        let fileName =  this.uuidv4() + '.' + extension;
        try {
            if (!fs.existsSync(uploadPath)){
                fs.mkdirSync(uploadPath);
            }
            fs.writeFileSync(uploadPath + '/' + fileName, imageBuffer, 'utf8');
        } catch (err) {
            console.error(err)
        }
        return uploadPath + '/' + fileName;
    }

    public uuidv4(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
    }
}

export default Tools;
