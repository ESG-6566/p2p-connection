import process from 'node:process'
import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { multiaddr } from 'multiaddr'
import { ping } from '@libp2p/ping'
import { yamux } from '@chainsafe/libp2p-yamux'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'

const node = await createLibp2p({
  addresses: {
    // add a listen address (localhost) to accept TCP connections on a random port
    listen: ['/ip4/127.0.0.1/tcp/0']
  },
  transports: [tcp()],
  connectionEncryption: [noise()],
  streamMuxers: [yamux()],
  peerDiscovery: [pubsubPeerDiscovery()],
  services: {
    pubsub: gossipsub(),
    ping: ping({
      protocolPrefix: 'ipfs'
    }),
  },
})

// start libp2p
await node.start()
console.log('libp2p has started')

// print out listening addresses
console.log('listening on addresses:')
node.getMultiaddrs().forEach((addr) => {
  console.log(addr.toString())
})

// If an address is provided via command line, dial to that node
if (process.argv.length > 2) {
  const remoteAddr = multiaddr(process.argv[2]);
  console.log(`Trying to connect to ${remoteAddr.toString()}`);

  try {
    await node.dial(remoteAddr);
    console.log('Connection established successfully');
  } catch (error) {
    console.error('Failed to connect:', error);
  }
} else {
  console.log('No remote peer address provided, please provide an address to connect.');
}

const stop = async () => {
  // stop libp2p
  await node.stop()
  console.log('libp2p has stopped')
  process.exit(0)
}

process.on('SIGTERM', stop)
process.on('SIGINT', stop)

