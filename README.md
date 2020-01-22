# pubsub-construction-validator

Validates the construction of the publisher and subscriber for job-acceptor and job-requestor.

## Interfaces

```typescript
interface IChannelContainer {
  [channel: string]: {
    subscribed?: boolean
    channel: string // should match the outer key
    timeout?: number
    reRequest?: number
  }
}
```

```typescript
interface IChannelInfo {
  jobType: string
  channel?: string
  timeout?: number
  reRequest?: number
}
```

## Public Methods

```typescript
validatePubSub() => [RedisClient, RedisClient]
/**
 * Makes sure that either the options or publisher and subscriber are defined.
 * @param publisher A redis client that is set as a publisher
 * @param subscriber A redis client tha tis set as a subscriber
 * @param [options] The client options for the redis client to allow RedisClients to be created. It will only be used if a publisher was not provided.  It has a default value of {"host": "127.0.0.1", "port": 4210}
 * @param [maxListeners] The max number of listeners for the publisher and subscriber.  Has a default value of 30
 * @returns An array containing a valid publisher and subscriber
 */
```

```typescript
fillChannelContainer(channels: IChannelInfo[]) => IChannelContainer
  /**
   * Fills channel container using the IChannelInfo object given to the constructor.  Also makes sure that the
   * timeout and rerequest times are valid
   * @param channels The array of IChannelInfo
   * @returns channel container where the keys are the names of the channels, and the values are objects containing the
   * connection information for each channel
   */
```

## Usage

I frankly have no intention of using this outside of the JobRequestor and JobAcceptor classes. However, if you do want to use it elsewhere for whatever reason, here's what my code looks like in the JobRequestor class.

```typescript
export default class JobRequestor {
  constructor(
    private channels: IChannelInfo[],
    publisher?: RedisClient,
    subscriber?: RedisClient,
    options?: ClientOpts
  ) {
    // Calls validatePubSub to make sure that either the publisher or options parameters were given and valid.  If not,
    // this will throw an error
    ;[this.publisher, this.subscriber] = this.constructionValidator.validatePubSub(
      publisher,
      subscriber,
      options
      // using the default listeners of 30
    )
    // Fill the channel list with all the channels that should be subscribed to/published to
    this.channelContainer = this.constructionValidator.fillChannelContainer(this.channels)
  }
```
