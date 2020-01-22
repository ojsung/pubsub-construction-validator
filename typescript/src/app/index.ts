import { ClientOpts, RedisClient, createClient } from 'redis'
import { IChannelInfo } from './models/channel-info.interface'
import { IChannelContainer } from './models/channel-container.interface'

/**
 * Makes sure that either the options or publisher and subscriber are defined.
 */
export default class ConstructionValidator {
  /**
   * Makes sure that either the options or publisher and subscriber are defined.
   * @param publisher A redis client that is set as a publisher
   * @param subscriber A redis client tha tis set as a subscriber
   * @param options The client options for the redis client to allow RedisClients to be created.
   * It will only be used if a publisher was not provided.  It has a default value of {"host": "127.0.0.1", "port": 4210}
   * @returns An array containing a valid publisher and subscriber
   */
  public validatePubSub(
    publisher: RedisClient | undefined,
    subscriber: RedisClient | undefined,
    options: ClientOpts = {
      "host": "127.0.0.1",
      "port": 4210
    },
    maxListeners: number = 30
  ) {
    if (!(maxListeners && maxListeners > 0)) {
      maxListeners = 30
    } else {
      maxListeners = Math.ceil(maxListeners)
    }
    if (publisher) {
      if (subscriber) {
        // Since a publisher and subscriber were both provided,
        // set the max number of jobs that can be taken by the listeners
        publisher.setMaxListeners(maxListeners)
        subscriber.setMaxListeners(maxListeners)
      } else {
        // Only a proper publisher was given
        subscriber = publisher.duplicate()
        publisher.setMaxListeners(maxListeners)
        subscriber.setMaxListeners(maxListeners)
      }
    } else {
      if (!options) {
        // If the options were not set, and there isn't a valid publisher, throw an error
        throw new Error(
          'Must provide either the Redis connection options OR a publisher and/or subscriber.'
        )
      } else {
        // If a valid publisher was not provided, but the options were,
        // create the RedisClients from the options.
        publisher = createClient(options) as RedisClient
        publisher.setMaxListeners(maxListeners)
        subscriber = publisher.duplicate() as RedisClient
      }
    }
    return [publisher, subscriber]
  }

  /**
   * Fills channel container using the IChannelInfo object given to the constructor.  Also makes sure that the
   * timeout and rerequest times are valid
   * @param channels The array of IChannelInfo
   * @returns channel container where the keys are the names of the channels, and the values are objects containing the
   * connection information for each channel
   */
  public fillChannelContainer(channels: IChannelInfo[]): IChannelContainer {
    const channelContainer: IChannelContainer = {}
    channels.forEach((channel: IChannelInfo) => {
      const timeout = channel.timeout && channel.timeout > 0 ? channel.timeout : 30000
      const reRequest = channel.reRequest && channel.reRequest > 0 ? channel.reRequest : 5000
      if (channel.channel) {
        channelContainer[channel.channel] = {
          channel: channel.channel,
          timeout,
          reRequest
        }
      } else {
        channelContainer[channel.jobType] = {
          channel: channel.jobType,
          timeout,
          reRequest
        }
      }
    })
    return channelContainer
  }
}
