local vaildReote = game.ReplicatedStorage:WaitForChild('SubmitRemote')
local ApiClient = require(script.Parent.ApiClient)


vaildReote.OnServerInvoke = function(player)
    local vCode = ApiClient.getCode(player)

    return vCode
end