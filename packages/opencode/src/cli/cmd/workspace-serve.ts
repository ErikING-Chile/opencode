import { cmd } from "./cmd"
import { withNetworkOptions, resolveNetworkOptions } from "../network"
import { WorkspaceServer } from "../../control-plane/workspace-server/server"

export const WorkspaceServeCommand = cmd({
  command: "workspace-serve",
  builder: (yargs) => withNetworkOptions(yargs),
  describe: "starts a remote Arche workspace event server",
  handler: async (args) => {
    const opts = await resolveNetworkOptions(args)
    const server = WorkspaceServer.Listen(opts)
    console.log(`Arche workspace event server listening on http://${server.hostname}:${server.port}/event`)
    await new Promise(() => {})
    await server.stop()
  },
})
