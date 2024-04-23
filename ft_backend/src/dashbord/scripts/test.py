import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import sys
import json
import numpy as np
from matplotlib.colors import LightSource


y_min = -1.40
y_max = 1.35
x_min = -1.72
x_max = 2.05
z_min = 0.93
z_max = 100



def bezier_curve(t, start, control1, control2, end):
    x = (1 - t) ** 3 * start[2] + 3 * (1 - t) ** 2 * t * control1[2] + 3 * (1 - t) * t ** 2 * control2[2] + t ** 3 * end[2]
    y = (1 - t) ** 3 * start[0] + 3 * (1 - t) ** 2 * t * control1[0] + 3 * (1 - t) * t ** 2 * control2[0] + t ** 3 * end[0]
    z = (1 - t) ** 3 * start[1] + 3 * (1 - t) ** 2 * t * control1[1] + 3 * (1 - t) * t ** 2 * control2[1] + t ** 3 * end[1]
    return x, y, z

def check_faute(id, point):
    if id == 0 and float(point) < 0.165:
        return 'o'
    elif id == 1 and float(point) > 0.165:
        return 'o'
    else:
        return 'x'

data_args = sys.argv[1:]
data_str = ''.join(data_args)
data = json.loads(data_str)
print(data)
id = data['Players'][0]['id']
gameid = data['id']
profilPic = data['Players'][0]
def coloring(i):
    if (i == id):
        return 'red'
    else:
        return 'green'

# Normalize x and y coordinates
for point in data['DataPlayers']:
    point['Start'][2] = ((point['Start'][2] - x_min) / (x_max - x_min)) * 100
    point['Start'][0] = ((point['Start'][0] - y_min) / (y_max - y_min)) * 100
    point['Start'][1] = ((point['Start'][1] - z_min) / (z_max - z_min)) * 100
    point['C1'][2] = ((point['C1'][2] - x_min) / (x_max - x_min)) * 100
    point['C1'][0] = ((point['C1'][0] - y_min) / (y_max - y_min)) * 100
    point['C1'][1] = ((point['C1'][1] - z_min) / (z_max - z_min)) * 100
    point['C2'][2] = ((point['C2'][2] - x_min) / (x_max - x_min)) * 100
    point['C2'][0] = ((point['C2'][0] - y_min) / (y_max - y_min)) * 100
    point['C2'][1] = ((point['C2'][1] - z_min) / (z_max - z_min)) * 100
    point['End'][2] = ((point['End'][2] - x_min) / (x_max - x_min)) * 100
    point['End'][0] = ((point['End'][0] - y_min) / (y_max - y_min)) * 100
    point['End'][1] = ((point['End'][1] - z_min) / (z_max - z_min)) * 100

fig = plt.figure(figsize=(20, 20), facecolor='none')  # Set facecolor to 'none'
ax = fig.add_subplot(111, projection='3d')

# Draw the border in 3D
ax.plot([0, 0], [0, 100], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front left line
ax.plot([0, 100], [100, 100], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front top line
ax.plot([100, 100], [100, 0], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front right line
ax.plot([100, 0], [0, 0], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front bottom line

# Draw the main line in 3D
ax.plot([50, 50], [2, 98], [0, 0], color="red", alpha=1, linewidth=55)
ax.plot([50, 50], [2, 98], [0, 0], color='b', alpha=0.8, linewidth=50)

# Plotting the data
for point in data['DataPlayers']:
    colorplot = coloring(point['Playerid'])
    if point['Playerid'] == id: 
        mar = check_faute(0,point['Start'][2])
        if(mar == 'o'):
            colorplot = "white"
        ax.scatter(point['Start'][2], point['Start'][0], point['Start'][1], color=colorplot,s=700, alpha=1, marker=mar)  # s controls the size of the "balls"
        ax.scatter(point['End'][2], point['End'][0], point['End'][1], color=colorplot, s=700, alpha=1)  # s controls the size of the "balls"

# Set limits and axis properties
ax.set_xlim([35, 80])
ax.set_ylim([25, 80])
ax.set_zlim([0, 1])
ax.set_axis_off()

ax.view_init(elev=15, azim=-0.25)  # Set the elevation (up/down) and azimuth (rotation around z-axis) angles
ax.set_box_aspect([4, 2, 1])

# Save the plot to a file
plt.savefig(f'./{gameid}_1.png', transparent=True,  pad_inches=(0.1, 0.05))  # Set transparent to True

# Close the plot
plt.close()
fig = plt.figure(figsize=(20, 20), facecolor='none')  # Set facecolor to 'none'
ax = fig.add_subplot(111, projection='3d')

# Draw the border in 3D
ax.plot([0, 0], [0, 100], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front left line
ax.plot([0, 100], [100, 100], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front top line
ax.plot([100, 100], [100, 0], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front right line
ax.plot([100, 0], [0, 0], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front bottom line

# Draw the main line in 3D
ax.plot([50, 50], [2, 98], [0, 0], color="red", alpha=1, linewidth=55)
ax.plot([50, 50], [2, 98], [0, 0], color='b', alpha=0.8, linewidth=50)

for point in data['DataPlayers']:
    colorplot = coloring(point['Playerid'])
    
    if point['Playerid'] != id:
        mar = check_faute(1,point['Start'][2])
        if(mar == 'o'):
            colorplot = "white"
        ax.scatter(point['Start'][2], point['Start'][0], point['Start'][1], color=colorplot, s=700, alpha=1, marker=mar)  # s controls the size of the "balls"
        ax.scatter(point['End'][2], point['End'][0], point['End'][1], color=colorplot, s=700, alpha=1)  # s controls the size of the "balls"

# Set limits and axis properties
ax.set_xlim([35, 80])
ax.set_ylim([25, 80])
ax.set_zlim([0, 1])
ax.set_axis_off()

ax.view_init(elev=15, azim=-0.25)  # Set the elevation (up/down) and azimuth (rotation around z-axis) angles
ax.set_box_aspect([4, 2, 1])

# Save the plot to a file
plt.savefig(f'./{gameid}_2.png', transparent=True,  pad_inches=(0.1, 0.05))  # Set transparent to True



plt.close()
fig = plt.figure(figsize=(20, 20), facecolor='none')  # Set facecolor to 'none'
ax = fig.add_subplot(111, projection='3d')

# Draw the border in 3D
ax.plot([0, 0], [0, 100], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front left line
ax.plot([0, 100], [100, 100], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front top line
ax.plot([100, 100], [100, 0], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front right line
ax.plot([100, 0], [0, 0], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front bottom line

# Draw the main line in 3D
ax.plot([50, 50], [-2, 102], [0,0.3], color='b', alpha=1, linewidth=2)


for point in data['DataPlayers']:
    colorplot = coloring(point['Playerid'])
    if point['Playerid'] == id:
        mar = check_faute(0,point['Start'][2])
        if(mar == 'o'):
            colorplot = "white"
        ax.scatter(point['Start'][2], point['Start'][0], point['Start'][1], color=colorplot, s=700, alpha=1,marker=mar)  # s controls the size of the "balls"
        ax.scatter(point['End'][2], point['End'][0], point['End'][1], color=colorplot, s=700, alpha=1)  # s controls the size of the "balls"
        t_values = np.linspace(0, 1, 100)
        curve_points = np.array([bezier_curve(t, point['Start'], point['C1'], point['C2'],point['End']) for t in t_values])
        ax.plot(curve_points[:, 0], curve_points[:, 1], curve_points[:, 2], colorplot, linewidth=3)

# Set limits and axis properties
ax.set_xlim([0, 100])
ax.set_ylim([0, 100])
ax.set_zlim([0, 1])
ax.set_axis_off()

ax.view_init(elev=0, azim=-90)  # Set the elevation (up/down) and azimuth (rotation around z-axis) angles
ax.set_box_aspect([4, 2, 1])

# Save the plot to a file
plt.savefig(f'./{gameid}_3.png', transparent=True, pad_inches=(0.2, 0.05))   # Set transparent to True




plt.close()
fig = plt.figure(figsize=(20, 20), facecolor='none')  # Set facecolor to 'none'
ax = fig.add_subplot(111, projection='3d')

# Draw the border in 3D
ax.plot([0, 0], [0, 100], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front left line
ax.plot([0, 100], [100, 100], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front top line
ax.plot([100, 100], [100, 0], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front right line
ax.plot([100, 0], [0, 0], [0, 0], color='b', linewidth=5, alpha=0.8)  # Front bottom line

# Draw the main line in 3D
ax.plot([50, 50], [-2, 102], [0,0.3], color='b', alpha=1, linewidth=2)


for point in data['DataPlayers']:
    colorplot = coloring(point['Playerid'])
    
    if point['Playerid'] != id:
        mar = check_faute(0,point['Start'][2])
        if(mar == 'o'):
            colorplot = "white"
        ax.scatter(point['Start'][2], point['Start'][0], point['Start'][1], color=colorplot, s=700, alpha=1,marker=mar)  # s controls the size of the "balls"
        ax.scatter(point['End'][2], point['End'][0], point['End'][1], color=colorplot, s=700, alpha=1)  # s controls the size of the "balls"
        t_values = np.linspace(0, 1, 100)
        curve_points = np.array([bezier_curve(t, point['Start'], point['C1'], point['C2'],point['End']) for t in t_values])
        ax.plot(curve_points[:, 0], curve_points[:, 1], curve_points[:, 2], color=colorplot, linewidth=3)


# Set limits and axis properties
ax.set_xlim([0, 100])
ax.set_ylim([0, 100])
ax.set_zlim([0, 1])
ax.set_axis_off()
ax.view_init(elev=0, azim=-90) 
ax.set_box_aspect([4, 2, 1])

# Save the plot to a file
plt.savefig(f'./{gameid}_4.png', transparent=True, pad_inches=(5, 10))  # Set transparent to True



print('Plots generated successfully')