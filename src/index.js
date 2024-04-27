import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'

const node = await createLibp2p({
  transports: [tcp()],
  connectionEncryption: [noise()],
  streamMuxers: [mplex()]
})

