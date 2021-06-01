import { HealthCheckBaseRs, HealthCheckPortRs, HealthCheckProtocolRs } from '../../model/rebbit-manager-model';

export interface RabbitManagerHealthInterface {

  checkAlarms(): Promise<any>;

  checkLocalAlarms(): Promise<any>;

  checkCertificate(leftTime: number, unit: 'days' | 'weeks' | 'months' | 'years'): Promise<any>;

  checkPortHealth(port: number): Promise<HealthCheckPortRs>;

  checkProtocol(name: 'amqp091' | 'amqp10' | 'mqtt' | 'stomp' | 'web-mqtt' | 'web-stomp'): Promise<HealthCheckProtocolRs>;

  checkVirtualHosts(): Promise<any>;

  checkNodeMirrorSyncCritical(): Promise<HealthCheckBaseRs>;

  checkNodeQuorumCritical(): Promise<HealthCheckBaseRs>;

}
