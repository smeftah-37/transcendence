import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import json
import sys
import os

# Check if any arguments are provided
if len(sys.argv) < 2:
    print("No JSON data provided.")
    sys.exit(1)

# Combine arguments into a single JSON string
data_str = ''.join(sys.argv[1:])

# Load JSON data
try:
    data = json.loads(data_str)
except json.JSONDecodeError as e:
    print(f"Error decoding JSON: {e}")
    sys.exit(1)

# Create DataFrame
df = pd.DataFrame(data)

# Calculate win rate
df['win_rate'] = (df['won'] / df['played']) * 100

# Sort DataFrame by win rate
df = df.sort_values(by='win_rate', ascending=False)

# Create figure and axes
fig, ax = plt.subplots(figsize=(7, 10), dpi=300)

# Set dimensions
nrows = df.shape[0]
ncols = df.shape[1]

ax.set_xlim(0, ncols + 1)
ax.set_ylim(-.65, nrows + 1)

# Iterate
for y in range(0, nrows):
    # -- Player name
    ax.text(
        x=2, y=y,
        s=df['username'].iloc[y],
        fontsize=10, va='center', color='black'
    )

    # -- Level
    ax.text(
        x=3, y=y,
        s=f"Lvl: {df['lvl'].iloc[y]}",
        fontsize=10, va='center', color='black'
    )

    # -- Played
    ax.text(
        x=4, y=y,
        s=f"Played: {df['played'].iloc[y]}",
        fontsize=10, va='center', color='black'
    )

    # -- Won
    ax.text(
        x=5, y=y,
        s=f"Won: {df['won'].iloc[y]}",
        fontsize=10, va='center', color='black'
    )

    # -- Win Rate
    ax.text(
        x=6, y=y,
        s=f"Win Rate: {df['win_rate'].iloc[y]:.2f}%",
        fontsize=10, va='center', color='black'
    )

# Hide axes
ax.axis('off')

# Column titles
ax.text(
    x=24, y=nrows + .1,
    s='MIN.\nPLAYED',
    size=9,
    ha='center', va='center'
)
ax.text(
    x=29, y=nrows + .1,
    s='DRIBBLES\nPER 90',
    size=9,
    ha='center', va='center'
)
ax.text(
    x=35, y=nrows + .1,
    s='SUCCESS\nRATE (%)',
    size=9,
    ha='center', va='center'
)

# Title
fig.text(
    x=0.5, y=.92,
    s="OS MAIORES DRIBLADORES DO BRASILEIRÃO 23",
    va="bottom", ha="center",
    fontsize=14, color="black",  weight="bold"
)
fig.text(
    x=0.15, y=.85,
    s="Jogadores que estão entre os 25% melhores em tentativas de dribles por partida (por 90 minutos) \nque jogaram pelo menos 400 minutos. | Termporada 2023 \nDados da  Opta 2/11/2023  \nViz by @leonardo-barbosa777",
    va="bottom", ha="left",
    fontsize=7, color="#4E616C",
)

plt.savefig(
    "report.pdf",
    format='pdf', dpi=600,
    facecolor="#EFE9E6",
    bbox_inches="tight",
    edgecolor="none",
    transparent=False
)