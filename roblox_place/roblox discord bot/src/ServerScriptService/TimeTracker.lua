-- local ApiClient = require(script.Parent.ApiClient)
local Security = require(script.Parent.Security)

local TimeTracker = {}
local sessions = {}

function TimeTracker.start(player)
    if (Security.validatePlayer(player)) then
        local leaderstats = player:WaitForChild('leaderstats')

        sessions[player.UserId] = {
            lastUpdate = os.time()
        }

        task.spawn(function()
            while player.Parent and sessions[player.UserId] do
                task.wait(3)

                local session = sessions[player.UserId]
                local now = os.time()

                local delta = now - session.lastUpdate
                session.lastUpdate = now

                if delta > 0 then
                    leaderstats.Time.Value += delta
                    -- ApiClient.sendTime(player, delta)
                end
            end
        end)
    end
end

function TimeTracker.stop(player)
    if (Security.validatePlayer(player)) then
        local session = sessions[player.UserId]
        local leaderstats = player:WaitForChild('leaderstats')
        local time = leaderstats.Time.Value

        if session then
            if time > 0 then
                print("Final Total:", time)
            end
        end

        sessions[player.UserId] = nil
    end
end

return TimeTracker