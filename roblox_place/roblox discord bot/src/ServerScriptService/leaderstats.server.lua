game.Players.PlayerAdded:Connect(function(player)
	local leaderboard = Instance.new('Folder')
	leaderboard.Name = 'leaderstats'
	leaderboard.Parent = player
	
	local time = Instance.new('IntValue')
	time.Name = 'Time'
	time.Value = 0
	time.Parent = leaderboard
end)