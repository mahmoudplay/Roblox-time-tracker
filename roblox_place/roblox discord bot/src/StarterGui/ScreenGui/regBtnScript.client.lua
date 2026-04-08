local gui = script.Parent;
local btn = gui.regBtn;
local popout = gui.regFrame;
local closeBtn = popout.closeBtn
local getBtn = popout.getBtn
local codeLabel = popout.codeLabel
local vaildReote = game.ReplicatedStorage:WaitForChild('SubmitRemote')

local cooldown = false
local cooldownTime = 60

btn.MouseButton1Click:Connect(function()
    popout.Visible = true;
end)

closeBtn.MouseButton1Click:Connect(function()
    popout.Visible = false;
end)

getBtn.MouseButton1Click:Connect(function()
    if cooldown then return end
    
    cooldown = true

    local vCode = vaildReote:InvokeServer()
    codeLabel.Text = vCode.code;
    
    getBtn.Active = false
    
    for i = cooldownTime, 1, -1 do
        getBtn.Text = "Wait (" .. i .. ")"
        task.wait(1)
    end
    
    getBtn.Text = "Get Code"
    getBtn.Active = true
    cooldown = false
    
end)