/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  TextInput,
  SwipeableListView,
  TouchableHighlight, TouchableOpacity, TouchableNativeFeedback, TouchableWithoutFeedback,
  Animated, Easing, Dimensions,
} from 'react-native';
import symbolicateStackTrace from 'react-native/Libraries/Core/Devtools/symbolicateStackTrace';

populate = (grid) => {
  let tmp = grid.map(row => (
    <View style={[styles.container, { flexDirection: "row" }]}>
      { row.map(n => (
        <View style={n ? styles.cell : styles.zeroCell }>
          <Text style={n ? styles.cellFont : styles.zeroCellFont }>{ n }</Text>
        </View>
      ))}
    </View>
  ) );

  return (
    tmp
  );
}

init = () => {
  let grid = [];

  let n = Array.from({length: 16}, (v, i) => i);
  n.sort(() => Math.random() - 0.5);

  for (let i = 0, idx = 0; i < 4; ++i) {
    grid[i] = [];
    for (let j = 0; j < 4; ++j) {
      grid[i][j] = n[idx++];
    }
  }

  return grid;
}

getZerpPos = (grid) => {
  let pos = [-1, -1];

  for (let i = 0; i < 4; ++i) {
    for (let j = 0; j < 4; ++j) {
      if (grid[i][j] == 0) {
        pos = [i, j];
        break;
      }
    }
  }

  return pos;
}

initAnimations = () => {
  let animations = [];

  for (let i = 0; i < 16; ++i) {
    animations.push({
      x: new Animated.Value(0),
      y: new Animated.Value(0)
    });
  }

  return animations;
}

const App: () => Node = () => {
  const [text, setText] = useState('test');
  const [grid, setGrid] = useState(init());
  const [zeroPos, setZeroPos] = useState(getZerpPos(grid));

  const windowWidth = Dimensions.get('window').width;
  const cellWidth = Math.floor((windowWidth - 2) / 4 - 8) - 2;

  const [moveAnimation, setMoveAnimation] = useState(initAnimations());
  const [currSel, setCurrSel] = useState(0);

  callback = (n, i, j) => {
    let x = zeroPos[1];
    let y = zeroPos[0];
  
    if (x > -1 && y > -1) {
      let dx = Math.abs(x - j);
      let dy = Math.abs(y - i);
  
      if ((dx == 1 && dy == 0) || (dy == 1 && dx == 0)) {
        let tmp = grid[i][j];
        grid[i][j] = 0;
        grid[y][x] = tmp;
  
        setGrid([...grid]);
        setZeroPos([i, j]);

        let rx = 0;
        let ry = 0;

        if (dx) {
          rx = (x - j) < 0 ? 1 : -1;
        } else {
          ry = (y - i) < 0 ? 1 : -1;
        }
        
        return [rx, ry];
      }
    }

    return null;
  }

  move = (n, i, j) => {
    let r = callback(n, i, j);

    if (r) {
      let d = r[0] ? r[0] : r[1];
      let c = r[0] ? 'x' : 'y';

      moveAnimation[n][c].setValue(cellWidth * d);

      Animated.timing(moveAnimation[n][c], {
        toValue: 0,
        timing: 100,
        useNativeDriver: true
      }).start();
    }
  }

  return (
    <SafeAreaView style={[styles.safeview, {
      // Try setting `flexDirection` to `"row"`.
      flexDirection: "column"
    }]}>
      <Button
        onPress={() => {
          let tmp = grid[0][0];
          grid[0][0] = grid[0][1];
          grid[0][1] = tmp;

          setGrid([...grid]);
        }}
        title="Swap Grid"
        color="#841584"
        accessibilityLabel="Swap Grid"
      />

      <View style={[{padding: 20}]}>
        <Text>{ text }</Text>
        { grid.map((row, i) => (
          <View style={[styles.container, { flexDirection: "row" }]} key={'row' + i}>
            { row.map((n, j) => (
              <TouchableWithoutFeedback onPress={() => { move(n, i, j); }}>
              <Animated.View style={ [{
                  transform: [
                    { translateX: moveAnimation[n].x },
                    { translateY: moveAnimation[n].y }
                  ]
                }, n ? styles.cell : styles.zeroCell] } key={ n }>
                <Text style={n ? styles.cellFont : styles.zeroCellFont } key={'text' + n}>{ n }</Text>
              </Animated.View>
              </TouchableWithoutFeedback>
            ))}
          </View>
        ))}

      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeview: {
    flex: 1,
  },

  container: {
    // flex: 1,
    // backgroundColor: "red",
    margin: 1,
    padding: 0
  },

  cell: {
    flex: 3,
    backgroundColor: "#eaeaea",
    aspectRatio: 1,
    margin: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999
  },

  cellFont: {
    color: '#000'
  },

  zeroCell: {
    flex: 3,
    // backgroundColor: "#fff",
    aspectRatio: 1,
    margin: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -999, // works on ios
    elevation: -999, // works on android
  },

  zeroCellFont: {
    color: '#fff'
  }
});


export default App;
