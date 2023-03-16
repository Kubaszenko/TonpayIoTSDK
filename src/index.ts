enum DeviceStatus {
  ONLINE,
  BUSY,
  NOT_CONNECTED,
  CONNECTED,
  SLEEP,
  DEEP_SLEEP,
}

type TerminalEventType = DeviceStatus | 'todo';
type DeviceInfo = {
  name?: string;
  id: string;
  connected: boolean;
};

type TerminalService = {
  name: string;
  uuid: string;
  call(...args: any): Promise<any>;
};

type TerminalListener = {
  callback: Promise<any>;
  event: TerminalEventType;
};

interface BaseCruptoTerminal {
  connect(): Promise<DeviceStatus>;

  _status: DeviceStatus;
  _debug: boolean;
  connection: BluetoothDevice | null;
  server: BluetoothRemoteGATTServer | null;
  eventListeners?: TerminalListener[];

  isConnected(): boolean;

  log(k: string, v: any): void;

  deviceInfo(): DeviceInfo;
}

interface MVP extends BaseCruptoTerminal {
  getPayment(): Promise<string>;

  requestPayment(query: string): Promise<void>;
}

type Version1 = BaseCruptoTerminal & MVP;

abstract class CryptoTerminal implements BaseCruptoTerminal {
  get status(): DeviceStatus {
    return this._status;
  }

  set status(status: DeviceStatus) {
    this._status = status;
  }

  get debug(): boolean {
    return this._debug;
  }

  set debug(value: boolean) {
    this._debug = value;
  }

  _status: DeviceStatus = DeviceStatus.NOT_CONNECTED;

  connection: BluetoothDevice | null = null;
  server: BluetoothRemoteGATTServer | null = null;

  _debug: boolean = false;

  protected defaultServiceId = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
  protected defaultCharacteristic = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

  public isConnected(): boolean {
    return this.status === DeviceStatus.CONNECTED;
  }

  public log(key: string, val: any = null): void {
    if (this._debug) {
      // tslint:disable-next-line:no-console
      console.log(key, val);
    }
  }

  public deviceInfo(): DeviceInfo {
    if (!this.isConnected()) throw new Error('Device not connected');
    return {
      name: this.connection?.name,
      // @ts-ignore
      id: this.connection.id,
      connected: this.connection?.gatt?.connected || false,
    };
  }

  async connect(): Promise<DeviceStatus> {
    const options = {
      acceptAllDevices: true,
      optionalServices: [this.defaultServiceId],
    };

    try {
      this.log('Requesting Bluetooth Device...');
      this.log('with', JSON.stringify(options));

      this.connection = await navigator.bluetooth.requestDevice(options);

      if (this.connection.gatt) {
        this.server = await this.connection.gatt.connect();
        this.status = DeviceStatus.CONNECTED;

        if (this.debug) this.log('Connected', this.deviceInfo());
      } else {
        this.status = DeviceStatus.NOT_CONNECTED;
        throw new Error('Cannot locate gatt server');
      }
    } catch (error) {
      this.log('Connection error', error);
      this.status = DeviceStatus.NOT_CONNECTED;
    }
    return this.status;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class CryptoTerminalMVP extends CryptoTerminal implements Version1 {
  public async getPayment(): Promise<string> {
    if (!this.isConnected()) throw new Error('Device not connected');

    this.log('Getting Service...');
    // @ts-ignore
    const service: BluetoothRemoteGATTService = await this.server.getPrimaryService(this.defaultServiceId);

    this.log('Getting Characteristics...');

    const characteristics = await service.getCharacteristics(this.defaultCharacteristic);
    const val = await characteristics[0].readValue();
    const enc = new TextDecoder('utf-8');

    return enc.decode(val);
  }

  async requestPayment(query: string) {
    if (!this.isConnected()) throw new Error('Device not connected');

    this.log('Getting Service...');
    // @ts-ignore
    const service: BluetoothRemoteGATTService = await this.server.getPrimaryService(this.defaultServiceId);

    this.log('Getting Characteristics...');
    const enc = new TextEncoder();

    const characteristics = await service.getCharacteristics(this.defaultCharacteristic);

    this.log('Write Characteristics...');
    await characteristics[0].writeValue(enc.encode(query));
    this.log('Done');
  }
}
