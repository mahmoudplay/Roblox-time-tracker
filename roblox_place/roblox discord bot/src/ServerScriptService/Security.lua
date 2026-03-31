local Security = {}

function Security.validatePlayer(player)
    if not player or not player.UserId then
        return false
    end

    return true
end

return Security