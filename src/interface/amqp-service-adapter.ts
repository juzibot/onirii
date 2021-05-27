import MessageAdapter from './message-adapter';
import QueueAdapter from './queue-adapter';

export interface AmqpServiceAdapter extends QueueAdapter, MessageAdapter {

}