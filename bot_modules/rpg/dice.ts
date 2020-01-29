export class Die {
  self:string
  sides: number
  _number: number
  type: string
  constructor(self: string) {
    this.self=self
    this.sides = 6;
    this._number = 1;
    let temp:number[] = this.self.split(/[Dd]/,2).map((ind)=>parseInt(ind))
    console.log(temp[0], temp[1])
    switch (temp.length) {
      case 2:
        this.type = "die"
        if (temp[0]<1) {
          this._number = 1
          if (!(temp[0] >= 1)) {
            console.warn("Could not coerce LHS of die to number, assuming 1...")
          }
        }
        else {
          this._number = temp[0]
        }
        if (temp[1] >= 1) {
          this.sides = temp[1]
        } else {
          if (isNaN(temp[1])) {
            throw new TypeError("Could not parse RHS of die to number.")
          }
          else if (temp[1] <= 0) {
            throw new Error("Cannot have negative number of sides.")
          }
        }
        break;
      case 1:
        this.type = "modifier"
        this.sides = 1
        if (!isNaN(temp[0])) {
          this._number = temp[0]
        } else {
          throw new TypeError("Could not parse modifier as integer.")
        }
        break

      default:
        this.sides=0;
        throw new Error("Could not parse input as either xDy or modifier format.")
    }
  }
  static randInt(lowerBound: number, upperBound: number = 0): number {
    if (upperBound === 0) {
      upperBound = lowerBound
      lowerBound = 1
    }
    let output: number = (Math.ceil(Math.random() * (upperBound - lowerBound + 1) + lowerBound))
    return output
  }
  roll = (): number[] => {
    let output:number[] = []
    if (this.type == "modifier") {
      return [this._number]
    }
    else {
      for (let i = 0; i < this._number; i++) {
        output.push(Die.randInt(1, this.sides))
      }
      return output
    }
  }
  static sum(arr:number[]):number{
    return arr.reduce((total,val)=>total+=val)
  }
}