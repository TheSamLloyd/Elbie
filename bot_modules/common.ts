class Common {
  randInt(a: number, b: number): number {
    var out: number
    if (b) {
      out = Math.floor(Math.random() * (b - a + 1)) + a
    } else {
      out = Math.floor(Math.random() * (a + 1))
    }
    return out
  }
  sum(Array: number[]): number {
    return Array.reduce(function (total, value) { return total + value })
  }
  typed(arg: any): any {
    if (isNaN(parseFloat(arg))) {
      return arg
    } else if (Math.floor(parseFloat(arg)) === parseFloat(arg)) {
      return parseInt(arg)
    } else return parseFloat(arg)
  }
  orDef(val: any, def: any): any {
    return (val || def)
  }
  caps(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
  notNull(array: any[]): any[] {
    return array.filter(val => (val === 0 || val))
  }
}

export default new Common