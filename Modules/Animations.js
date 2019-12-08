import React, { useState, useEffect, Component } from 'react';
import { Animated, View, Easing } from 'react-native';

export const FadeInView = (props) => {
    const [fadeAnim] = useState(new Animated.Value(props.initial ? props.initial : 0))  
    useEffect(() => {
        Animated.timing(
            fadeAnim,
            {
                toValue: props.final ? props.final : 1,
                delay: props.delay ? props.delay : 1000,
                duration: props.duration ? props.duration : 2000,
            }
        ).start();
    }, [])
    return (
        <Animated.View                
            style={{
                ...props.style,
                opacity: fadeAnim,      
            }}
        >
            {props.children}
        </Animated.View>
    );
}

export const FadeInText = (props) => {
    const [fadeAnim] = useState(new Animated.Value(props.initial ? props.initial : 0))  
    useEffect(() => {
        Animated.timing(
            fadeAnim,
            {
                toValue: props.final ? props.final : 1,
                delay: props.delay ? props.delay : 1000,
                duration: props.duration ? props.duration : 500,
            }
        ).start();
    }, [])
    return (
        <Animated.Text             
            style={{
                ...props.style,
                opacity: fadeAnim,        
            }}
        >
            {props.children}
        </Animated.Text>
    );
}

export const ResizeText = (props) => {
    const [fontSize] = useState(new Animated.Value(props.initial))  
    useEffect(() => {
        Animated.timing(
            fontSize,
            {
                toValue: props.final,
                delay: props.delay,
                duration: props.duration,
            }
        ).start();
    }, [])
    return (
        <Animated.Text             
            style={{
                ...props.style,
                fontSize: fontSize,        
            }}
        >
            {props.children}
        </Animated.Text>
    );
}

export class LoadingSpin extends Component {
    constructor(props) {
      super(props);
      this.state = { spinAnim: new Animated.Value(0) }
    }
  
    componentDidMount(){
        Animated.loop(Animated.timing(
            this.state.spinAnim,
            {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true
            }
        )).start();
    }
  
    render() {
        const spin = this.state.spinAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return (
            <View style={{ ...this.props.style}}>
                <Animated.Image
                    style={{height:100, width: 100,transform: [{rotate: spin}] }}
                    source={require('./Assets/Pilly.png')} 
                />
            </View>
        );
    }
}