package main

import (
	"fmt"
	"math"
	"regexp"
	"slices"
	"strings"

	"github.com/crazy3lf/colorconv"
)

func main() {
	fmt.Println("/* welcome to colorscale */")
	fmt.Println()

	hexColors := map[string]string{
		"cortado":  "#774e24",
		"matcha":   "#4f772d",
		"pebble":   "#8e9aaf",
		"rooibos":  "#ff0000",
		"rose":     "#fb6f92",
		"powerade": "#00b4d8",
		"lassi":    "#ffb703",
		"lavender": "#a06cd5",
	}

	weight := map[string]float64{
		"rose":    -0.2,
		"rooibos": 0.2,
		"cortado": 0.4,
		"matcha":  0.15,
	}

	hexPattern := regexp.MustCompile(`^#[abcdefABCDEF0123456789]{6}$`)

	names := []string{}
	for name := range hexColors {
		names = append(names, name)
	}

	slices.Sort(names)

	for _, name := range names {
		hex := hexColors[name]
		if !hexPattern.MatchString(hex) {
			panic("hex is not valid hex code")
		}

		col, err := colorconv.HexToColor(hex)
		if err != nil {
			panic(err)
		}

		h, s, _ := colorconv.ColorToHSL(col)

		fmt.Printf(":root[data-theme=\"%s\"] {\n", name)

		levels := []float64{50, 100, 200, 300, 400, 500, 600, 700, 800, 900}
		primary := map[float64]string{}

		for _, lv := range levels {
			newLightness := math.Pow((1000-lv)/1000, 1+weight[name])
			out, err := colorconv.HSLToColor(h, s, newLightness)
			if err != nil {
				panic(err)
			}
			outHex := strings.TrimLeft(colorconv.ColorToHex(out), "0x")

			primary[lv] = strings.ToUpper(outHex)
		}

		for _, lv := range levels {
			primaryHex := primary[lv]
			fmt.Printf("\t--primary-%0.f: #%06s;\n", lv, primaryHex)
		}

		fmt.Println()
		fmt.Println("\t--gray: #80827d;")
		fmt.Println("\t--gray-50: #fafafa;")
		fmt.Println("\t--gray-100: #f2f2f2;")
		fmt.Println("\t--gray-200: #e6e6e5;")
		fmt.Println("\t--gray-300: #cccdcb;")
		fmt.Println("\t--gray-400: #b3b4b1;")
		fmt.Println("\t--gray-500: #80827d;")
		fmt.Println("\t--gray-600: #676864;")
		fmt.Println("\t--gray-700: #4d4e4b;")
		fmt.Println("\t--gray-800: #333432;")
		fmt.Println("\t--gray-900: #1a1a19;")

		fmt.Println("\t--border: #e6e6e5;")
		fmt.Println("\t--input: #e6e6e5;")
		fmt.Printf("\t--ring: #%s;\n", primary[100])
		fmt.Println("\t--background: #ffffff;")
		fmt.Println("\t--foreground: #1a1a19;")
		fmt.Println("\t--muted: #f2f2f2;")
		fmt.Println("\t--muted-foreground: #80827d;")
		fmt.Println("\t--accent: #f2f2f2;")
		fmt.Printf("\t--accent-foreground: #%s;\n", primary[700])
		fmt.Println("\t--destructive: #ff0000;")
		fmt.Println("\t--destructive-foreground: #ffffff;")
		fmt.Println("\t--card: #ffffff;")
		fmt.Println("\t--card-foreground: #1a1a19;")
		fmt.Println("\t--popover: #ffffff;")
		fmt.Println("\t--popover-foreground: #1a1a19;")

		fmt.Println("}")
	}

}
