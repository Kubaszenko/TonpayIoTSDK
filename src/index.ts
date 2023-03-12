import {v4 as uuidv4} from 'uuid';
type Owner = {
    email: string;
}


const getVersion = () => {

}

interface BasicDevice {
    version: () => Promise<number>;
    uuid:  string;
    status: 'active' | 'busy' | 'offline';
    havePrinter: boolean;
    owner?: Owner

}

class Device implements BasicDevice{
    async version() {
      return 2  
    };
    uuid: string;
    status: 'active' | 'busy' | 'offline';
    havePrinter: false;
    owner?: Owner | undefined;
    constructor(id: string) {
        this.uuid = id
        this.havePrinter = false
        this.status = 'active'




}

export const Greeter = (name: string) => `Hello ${name}`;
let myuuid = uuidv4();