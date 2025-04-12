class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title); // TODO: replace this text using this.engine.storyData to find the story title
        this.engine.addChoice("Begin the story");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation); // TODO: replace this text by the initial location of the story
    }
}

class Location extends Scene {
    create(key) {
        // Special statements for the scenes in JSON
        if (key === "Thimoraya Crossing") {
            this.engine.gotoScene(StoneSelectorLocation, key);
            return;
        }

        if (key === "Kwethya Cascade") {
            this.engine.gotoScene(KwethyaCascade, key);
            return;
        }

        if (key === "Nethmil Gate") {
            this.engine.gotoScene(NethmilGate, key);
            return;
        }
        
        // from the TODOs
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);

        if (locationData.Choices && locationData.Choices.length > 0) {
            for (let choice of locationData.Choices) {
                this.engine.addChoice(choice.Text, choice);
            }
        } else {
            this.engine.addChoice("The end.");
        }
    }

    handleChoice(choice) {
        if (choice) {
            this.engine.show("&gt; " + choice.Text);
            this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

// SUB-CLASSES ------------------------------------------------------------------------------------
// Location-specific Interactive Mechanism
class StoneSelectorLocation extends Location {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);
    
        if (!this.engine.data) this.engine.data = {};
        if (!this.engine.data.selectedStones) this.engine.data.selectedStones = [];
        if (this.engine.data.hasCrystal === undefined) this.engine.data.hasCrystal = false; // initialize crystal status
    
        const stones = this.engine.data.selectedStones;
    
        if (stones.length > 0) {
            this.engine.show("<i>Selected stones: " + stones.join(", ") + "</i>");
        }
    
        // Only allow selecting stones if less than 2 have been chosen
        if (stones.length < 2) {
            const stoneColors = ["Yellow", "Red", "Blue"];
            for (let color of stoneColors) {
                // Prevent selecting the same stone twice
                if (!stones.includes(color)) {
                    this.engine.addChoice("Touch " + color + " stone", {
                        isStoneChoice: true,
                        color,
                        locationKey: key
                    });
                }
            }
        }
    
        if (stones.length === 2) {
            const combo = stones.slice().sort().join("+");
            let target;
            let pathColor = "";
            
            // Combination of colored stones picked
            if (combo === "Red+Yellow" || combo === "Yellow+Red") {
                target = "Kwethya Cascade";
                pathColor = "Orange";
            } else if (combo === "Blue+Yellow" || combo === "Yellow+Blue") {
                target = "Lisahali Falls";
                pathColor = "Green";
            } else if (combo === "Blue+Red" || combo === "Red+Blue") {
                target = "Aurelem Veil";
                pathColor = "Purple";
            }
    
            if (target) {
                this.engine.show("<i>The " + pathColor + " path illuminates and the brush clears.</i>");
                this.engine.addChoice("Follow the " + pathColor + " path", {
                    Target: target
                });
            } else {
                this.engine.addChoice("Invalid combo. Try again.", {
                    resetStones: true,
                    locationKey: key
                });
            }
        }
    }        

    handleChoice(choice) {
        if (choice.isStoneChoice) {
            this.engine.show("&gt; Touch " + choice.color + " stone");
            this.engine.data.selectedStones.push(choice.color);
            this.engine.gotoScene(StoneSelectorLocation, choice.locationKey);
        } else if (choice.resetStones) {
            this.engine.show("&gt; Try again");
            this.engine.data.selectedStones = [];
            this.engine.gotoScene(StoneSelectorLocation, choice.locationKey);
        } else if (choice.Target) {
            this.engine.show("&gt; Follow the path");
            this.engine.data.selectedStones = [];
            this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

// LOCK AND KEY PUZZLE (CRYSTAL)
class KwethyaCascade extends Location {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);

        // Set hasCrystal to true when visiting Kwethya Cascade (only once)
        if (!this.engine.data.hasCrystal) {
            this.engine.data.hasCrystal = true; // Ensure this is only set once
        }

        // Give the option to escape or take the secret path
        this.engine.addChoice("Escape back to Thimoraya Crossing", {
            Target: "Thimoraya Crossing"
        });
        this.engine.addChoice("Take the secret path", {
            Target: "Filiesa Hollow"
        });
    }

    handleChoice(choice) {
        if (choice.Target) {
            this.engine.show("&gt;" + choice.Text);
            this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class NethmilGate extends Location {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);

        // Check if the player has the crystal
        if (this.engine.data.hasCrystal) {
            // If the player has the crystal, allow them to enter Everile's Heart
            this.engine.show("<i>At last, the crystal has returned to its home. Everyone, welcome the true heir!</i>")
            this.engine.addChoice("Enter Everile’s Heart", {
                Target: "Everile’s Heart"
            });
        } else {
            // If the player doesn't have the crystal, show the yearning message and offer return to Filiesa Hollow
            this.engine.show("<i>The Nethmil Gate yearns for its beloved crystal. Go find it.</i>");
            this.engine.addChoice("Return to Filiesa Hollow", {
                Target: "Filiesa Hollow"
            });
        }
    }

    handleChoice(choice) {
        if (choice.Target) {
            this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');