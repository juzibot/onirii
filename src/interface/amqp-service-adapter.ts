import MessageAdapter from './message-adapter';
import OriginalQueueInterface from './original-queue-interface';

export interface AmqpServiceAdapter extends OriginalQueueInterface, MessageAdapter {

}
