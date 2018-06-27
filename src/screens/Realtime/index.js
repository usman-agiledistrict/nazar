"use strict";
import React, { Component } from "react";
import {
  Animated,
  AppRegistry,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Linking,
  View,
  ScrollView,
  Button
} from "react-native";
import { RNCamera } from "react-native-camera";
import { Text, Icon } from "react-native-elements";
import timer from "react-native-timer";
import SlidingUpPanel from "rn-sliding-up-panel";
import axios from 'axios';

import TensorFlowModule from "../../tensorflow/TensorFlow";
import { TfImageRecognition } from "react-native-tensorflow";

import styles from "./styles";

const serverURL = "https://nazar-server.herokuapp.com";

const http = axios.create({
  baseURL: serverURL
});

export default class Realtime extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: null
  });

  constructor(props) {
    super(props);
    this.image = require("../../../assets/index.jpg");
    this.state = {
      result: "Detected item",
      value: null,
      flashMode: RNCamera.Constants.FlashMode.off,
      flash: "auto",
      showFlashOptions: false,
      type: RNCamera.Constants.Type.back,
      visible: false
    };
    //this.alreadySelectedImages = this.props.navigation.state.params.alreadySelectedImages;
    this.goBack = this.goBack.bind(this);
    this.takePicture = this.takePicture.bind(this);
    this.selectFlashMode = this.selectFlashMode.bind(this);
    this.showFlashOptionsBlock = this.showFlashOptionsBlock.bind(this);
    this.switchCamera = this.switchCamera.bind(this);
    timer.setInterval(this, "takePicture", () => this.takePicture(), 1000);
    timer.setInterval(this, "clearInterval", () => this.clearInterval(), 30000);
  }

  componentDidMount() {
    process.nextTick = setImmediate; // RN polyfill
  }

  async _reg(img) {
    var preder = null;
    var items = "";
    /*const { content, photoPath } = this.state.photoAsBase64;
    TensorFlowModule.checkForBlurryImage(
      imageAsBase64,
      error => {
        // error handling
      },
      msg => {
        resolve(msg);
      }
    );*/
    /*try {
      const tfImageRecognition = new TfImageRecognition({
        model: require("../../../assets/retrained_graph.pb"),
        labels: require("../../../assets/retrained_labels.txt")
      });

      const results = await tfImageRecognition.recognize({
        image: img //this.image
      });

      results.forEach(
        result => ((preder = result.confidence), (items = result.name))
      );

      await tfImageRecognition.close();

      this.setState({
        result: items,
        value: preder * 100 + "%"
      });
    } catch (err) {
      alert(err);
      //console.log(err);
    }*/
    console.log(img);

    /*http.post("/classify_image/", {
      data: [
        {
          ext: "jpg",
          path: img,
          type: "local"
        }
      ]
    }).then ((response) => console.log (response));*/

    const userInfoResp = await fetch(
      "https://nazar-server.herokuapp.com/classify_image/",
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: [
            {
              ext: "jpg",
              path: img,
              type: "local"
            }
          ]
        })
      }
    ).catch(function(err) {
      console.log(err);
    });
    const userInfo = await userInfoResp.text();

    console.log(userInfo);
    /*
    const responseM = await fetch(
      "https://api.voximplant.com/platform_api/Logon/?account_email=" +
        Vemail +
        "&account_password=" +
        Vpassword
    );
    const jsonM = await responseM.json();
    const api_key = jsonM.api_key;
    const account_id = JSON.stringify(jsonM.account_id);
    await AsyncStorage.setItem("API", api_key);
    await AsyncStorage.setItem("ACC_ID", account_id);
    console.log(api_key);
    console.log(account_id);*/
  }

  takePicture = async function() {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      //console.log(data.uri);
      /*this.setState({
        ...this.state,
        photoAsBase64: { content: data.base64, photoPath: data.uri }
      });*/
      this._reg(data.uri.replace("file:///", ""));
      //this._reg(data.uri);
    }
  };

  componentWillUnmount() {
    timer.clearInterval(this);
  }

  async clearInterval() {
    timer.clearInterval(this);
    this.setState({
      result: "",
      value: ""
    });
  }

  goBack() {
    this.props.navigation.goBack();
  }

  selectFlashMode(type) {
    if (type === "auto") {
      this.setState({
        flashMode: RNCamera.Constants.FlashMode.auto,
        flash: "auto",
        showFlashOptions: false
      });
    } else if (type === "off") {
      this.setState({
        flashMode: RNCamera.Constants.FlashMode.off,
        flash: "off",
        showFlashOptions: false
      });
    } else {
      this.setState({
        flashMode: RNCamera.Constants.FlashMode.on,
        flash: "on",
        showFlashOptions: false
      });
    }
  }

  showFlashOptionsBlock() {
    this.setState({
      showFlashOptions: true
    });
  }

  switchCamera() {
    if (this.state.type === RNCamera.Constants.Type.back) {
      this.setState({
        type: RNCamera.Constants.Type.front
      });
    } else {
      this.setState({
        type: RNCamera.Constants.Type.back
      });
    }
  }

  render() {
    let autoColor = this.state.flash === "auto" ? "yellow" : "white";
    let onColor = this.state.flash === "on" ? "yellow" : "white";
    let offColor = this.state.flash === "off" ? "yellow" : "white";
    return (
      <View style={styles.container}>
        <View style={styles.cameraOptionsHeader}>
          <TouchableOpacity onPress={this.goBack}>
            <Icon iconStyle={styles.backButton} name="arrow-back" />
          </TouchableOpacity>
          {this.state.showFlashOptions ? (
            <View style={styles.flashOptionsContainer}>
              <TouchableOpacity
                style={{ paddingRight: 5 }}
                onPress={() => this.selectFlashMode("auto")}
              >
                <Text style={[{ color: autoColor }, styles.flashOptionsText]}>
                  Auto
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ paddingRight: 5 }}
                onPress={() => this.selectFlashMode("on")}
              >
                <Text style={[{ color: onColor }, styles.flashOptionsText]}>
                  On
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ paddingRight: 5 }}
                onPress={() => this.selectFlashMode("off")}
              >
                <Text style={[{ color: offColor }, styles.flashOptionsText]}>
                  Off
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={this.showFlashOptionsBlock}>
              <Icon
                iconStyle={styles.flashIcon}
                type="MaterialIcons"
                name={
                  this.state.flash === "auto"
                    ? "flash-auto"
                    : this.state.flash === "on"
                      ? "flash-on"
                      : "flash-off"
                }
              />
            </TouchableOpacity>
          )}
        </View>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={this.state.type}
          flashMode={this.state.flashMode}
          mirrorImage={true}
          permissionDialogTitle={"Permission to use camera"}
          permissionDialogMessage={
            "We need your permission to use your camera phone"
          }
        />
        <View style={styles.cameraClickBlock}>
          <View style={{ flex: 1 }} />
          <Animated.View style={[styles.animator]}>
            <ScrollView style={{ height: 100 }}>
              <Text
                style={{
                  fontSize: 26,
                  color: "#fff",
                  fontFamily: "bold",
                  textAlign: "center",
                  marginTop: 10
                }}
              >
                {this.state.result}
              </Text>
              <Text
                style={{
                  fontSize: 22,
                  color: "#fff",
                  fontFamily: "bold",
                  textAlign: "center",
                  marginTop: 10
                }}
              >
                {this.state.value}
              </Text>
            </ScrollView>
          </Animated.View>
          <Icon
            iconStyle={styles.googleLink}
            type="font-awesome"
            name="google"
            onPress={() =>
              Linking.openURL(
                `https://www.google.com/search?q=${this.state.result}`
              )
            }
          />
          <Icon
            iconStyle={styles.wikiLink}
            type="font-awesome"
            name="wikipedia-w"
            onPress={() =>
              Linking.openURL(
                `https://en.m.wikipedia.org/w/index.php?search=${
                  this.state.result
                }&title=Special:Search&fulltext=1`
              )
            }
          />
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end"
            }}
            onPress={this.switchCamera}
          >
            <Icon iconStyle={styles.cameraIcon} name="switch-camera" />
          </TouchableOpacity>
        </View>
        <Button
          title="Show Details"
          onPress={() => this.setState({ visible: true })}
        />
        <SlidingUpPanel
          visible={this.state.visible}
          onRequestClose={() => this.setState({ visible: false })}
        >
          <View style={styles.slider}>
            <Text
              style={{
                fontSize: 26,
                color: "#00aeefff",
                fontFamily: "bold",
                marginBottom: 70
              }}
            />
            <Text
              style={{
                fontSize: 26,
                color: "#00aeefff",
                fontFamily: "bold",
                marginBottom: 40
              }}
            >
              {this.state.result}
            </Text>
          </View>
        </SlidingUpPanel>
      </View>
    );
  }
}
