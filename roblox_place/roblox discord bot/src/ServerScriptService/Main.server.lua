local TimeTracker = require(script.Parent.TimeTracker)

game.Players.PlayerAdded:Connect(function(player)
    TimeTracker.start(player)
end)

game.Players.PlayerRemoving:Connect(function(player)
    TimeTracker.stop(player)
end)