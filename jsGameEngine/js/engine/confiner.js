// Import the necessary classes from the 'engine' directory
import GameObject from '../engine/gameobject.js';


// Define a new class, Platform, which extends (inherits from) GameObject
class Confiner{
  
  // Define the constructor for the Platform class. It takes arguments for the x and y coordinates,
  // width, height, and color (with a default value of 'gray' if no color is provided)
  constructor(x, y, width, height) {
    this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	
    // Call the constructor of the superclass (GameObject) with the x and y coordinates
  
  }
}

// Export the Platform class as the default export of this module
export default Confiner;
