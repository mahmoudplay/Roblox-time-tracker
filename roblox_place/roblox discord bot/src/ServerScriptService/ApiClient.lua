local HttpService = game:GetService("HttpService")
local apiKey = HttpService:GetSecret("AUTH")

local ApiClient = {}

function ApiClient.sendTime(player, minutes)
    local timestamp = os.time()

    local data = {
        username = player.Name,
        userId = player.UserId,
        minutes = minutes,
        timestamp = timestamp
    }

    local json = HttpService:JSONEncode(data)

    HttpService:PostAsync(
        "http://localhost:3000/",
        json,
        Enum.HttpContentType.ApplicationJson,
        false,
        {
			["authorization"] = apiKey,
        }
    )
end

return ApiClient