class Common {
  randInt(a: number, b?: number): number {
    var out: number
    if (b) {
      out = Math.floor(Math.random() * (b - a + 1)) + a
    } else {
      out = Math.floor(Math.random() * (a + 1))
    }
    return out
  }
  caps(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
  notNull(array: any[]): any[] {
    return array.filter(val => (val === 0 || val))
  }
  findMatch({ match, subst = true, strings }: { match: string; subst?: boolean; strings: string[] }): string[] {
    return strings.filter((str: string) => str.includes(match))
  }
}

export default new Common