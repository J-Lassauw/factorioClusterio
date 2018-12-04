json = require('json')

fileName = "researchSync.json"

local function initialize()
    script.on_event(defines.events.on_research_finished, function(event)
        if(event.by_script == true) then return end
        completed_technology = {
            name = event.research.name,
            level = event.research.level
        }
        game.write_file(fileName, json:encode(completed_technology) .. "\n", true, 0)
    end)
end

remote.remove_interface("researchSync")
remote.add_interface("researchSync", {
    setResearch = function(jsonString)
        local data = json:decode(jsonString)
        for name, technology in pairs(data) do
            if game.forces['player'].technologies[name] then
                if game.forces['player'].technologies[name].researched ~= name then
                    game.forces['player'].technologies[name].researched = name
                end
                if game.forces['player'].technologies[name].level ~= technology.level then
                    game.forces['player'].technologies[name].level = technology.level
                end
                script.raise_event(
                        defines.events.on_research_finished,
                        {research=game.forces['player'].technologies[name], by_script=true}
                )
                game.play_sound({path="utility/research_completed"})
                if game.forces['player'].technologies[name].researched == false then
                    game.print("Technology " + name + " synced at level" + technology.level)
                else
                    game.print("Technology " + name + " synced")
                end
            end
        end
    end
})

script.on_load(initialize())
script.on_init(initialize())
