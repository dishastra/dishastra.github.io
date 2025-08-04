import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import GlobeLib from 'globe.gl';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const Globe = forwardRef((props, ref) => {
  const globeRef = useRef();
  const globeInstance = useRef();
  const lastHoverState = useRef(false);

  useImperativeHandle(ref, () => ({
    setAutoRotate: (enabled) => {
      if (globeInstance.current && globeInstance.current.controls) {
        globeInstance.current.controls().autoRotate = enabled;
      }
    }
  }));

  useEffect(() => {
    // BACKGROUND TOGGLE: Set to true for white background, false for starry background
    const useWhiteBackground = true;
    
    const globe = GlobeLib()(globeRef.current)
      .showAtmosphere(false)
      // White background (for testing)
      .backgroundColor(useWhiteBackground ? '#000000' : 'rgba(0,0,0,0)')
      // Starry background (comment out the line above and uncomment below to revert)
      //.backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .showGlobe(false)
      .lights([]); // Remove default lights (AmbientLight + DirectionalLight)
    
    globeInstance.current = globe;

    // Apply background image only if not using white background
    if (!useWhiteBackground) {
      globe.backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png');
    }

    // Enable pointer interaction for mouse hover effect
    globe.enablePointerInteraction(true);

    // Renderer optimizations for better lighting
    const renderer = globe.renderer();
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.5; // Higher exposure for extreme spotlight intensities
    renderer.shadowMap.enabled = false; // Disable shadows for performance (we don't need them)

    // Auto-rotate
    //globe.controls().autoRotate = true;
    //globe.controls().autoRotateSpeed = 0.5;

    // Set fixed zoom
    globe.controls().enableZoom = false;
    const initialPosition = { lat: 20.5937, lng: 180, altitude: 1.4 };
    globe.pointOfView(initialPosition); // Set initial camera position to India

    // Smooth rotate on scroll
    let targetLng = initialPosition.lng;
    let currentLng = initialPosition.lng;
    const rotationSmoothness = 0.05; // Adjust for smoother/faster rotation

    const handleWheel = (event) => {
      // Use raycasting to check if mouse is over the globe sphere
      const canvas = globe.renderer().domElement;
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, globe.camera());

      // Create a sphere for intersection testing (will be cleaned up)
      const sphereGeometry = new THREE.SphereGeometry(globe.getGlobeRadius(), 8, 8);
      const sphereMaterial = new THREE.MeshBasicMaterial({ visible: false });
      const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
      
      const intersects = raycaster.intersectObject(sphereMesh);
      
      // Only handle wheel events when mouse is over the actual globe sphere
      if (intersects.length > 0) {
        event.preventDefault(); // Prevent page scroll only when over globe
        const rotationAmount = event.deltaY * 0.1; // Adjust sensitivity
        targetLng += rotationAmount;
      }
      // If mouse is not over globe sphere, allow normal page scrolling
      
      // Clean up temporary objects
      sphereGeometry.dispose();
      sphereMaterial.dispose();
    };

    const canvas = globe.renderer().domElement;
    canvas.addEventListener('wheel', handleWheel);

    // Variables for hover effect
    let frontTilesMesh = null;
    let backTilesMesh = null;
    let hoverLight = null;
    let globeRadius = 0;
    let lightTarget = null;
    
    // Animation variables for smooth transitions
    let targetIntensity = 0;
    let currentIntensity = 0;
    let isMouseOverGlobe = false;
    let animationFrameId = null;
    const fadeSpeed = 0.05; // Reduced from 0.1 for more gradual changes
    
    // Hover duration and intensity buildup
    let hoverStartTime = 0;
    let lastHoverPosition = new THREE.Vector3();
    let isHoveringInSameArea = false;
    const baseIntensity = 1500; // Dramatically higher base intensity
    const maxBoostedIntensity = 9000; // Extremely high max intensity for dramatic effect
    const hoverBuildupSpeed = 1.5; // How fast intensity builds up (seconds to reach max)
    let positionTolerance = 0; // Will be set relative to globe size
    
    // Smooth position tracking
    let targetPosition = new THREE.Vector3(0, 0, 0);
    let currentPosition = new THREE.Vector3(0, 0, 0);
    let targetLightPosition = new THREE.Vector3(0, 0, 0);
    let currentLightPosition = new THREE.Vector3(0, 0, 0);
    const positionSmoothness = 0.08; // Adjust for faster/slower position transitions

    // --- Kolkata tile animation variables (move to outer scope) ---
    let kolkataMesh = null;
    let kolkataMaterial = null;

    // Mouse move handler with proper raycasting and smooth transitions
    const handleMouseMove = (event) => {
      if (!hoverLight || !frontTilesMesh || !lightTarget) return;

      // Use the actual WebGL canvas for accurate coordinate calculation
      const canvas = globe.renderer().domElement;
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Use raycaster to find intersection with globe
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, globe.camera());

      // Create a sphere for intersection testing
      const sphereGeometry = new THREE.SphereGeometry(globeRadius, 32, 32);
      const sphereMaterial = new THREE.MeshBasicMaterial({ visible: false });
      const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
      
      const intersects = raycaster.intersectObject(sphereMesh);
      
      if (intersects.length > 0) {
        // Mouse is over the globe - fade in and hide cursor
        isMouseOverGlobe = true;
        event.target.style.cursor = 'none'; // Hide cursor when over globe
        if (!lastHoverState.current) {
          lastHoverState.current = true;
          if (props.onGlobeHoverChange) props.onGlobeHoverChange(true);
        }
        
        const intersectionPoint = intersects[0].point;
        
        // Check if we're hovering in the same area
        const currentDistance = intersectionPoint.distanceTo(lastHoverPosition);
        
        if (currentDistance < positionTolerance && isHoveringInSameArea) {
          // Still in the same area - intensity will build up in animation loop
          // No need for frequent logging here
        } else {
          // Moved to a new area - reset hover tracking
          lastHoverPosition.copy(intersectionPoint);
          hoverStartTime = Date.now();
          isHoveringInSameArea = true;
          targetIntensity = baseIntensity; // Start with base intensity
          console.log('New hover area detected, distance moved:', currentDistance.toFixed(1));
        }
        
        // Set target positions for smooth interpolation with distance-based intensity
        const surfaceToLightDistance = 20; // Match spotlight positioning
        const lightPosition = intersectionPoint.clone().normalize().multiplyScalar(globeRadius + surfaceToLightDistance);
        targetLightPosition.copy(lightPosition);
        targetPosition.copy(intersectionPoint);
        
        // Distance-based intensity scaling (closer = more intense)
        const distanceFromCenter = intersectionPoint.length();
        const distanceScale = Math.max(0.8, Math.min(1.2, globeRadius / distanceFromCenter));
        const scaledBaseIntensity = baseIntensity * distanceScale;
        const scaledMaxIntensity = maxBoostedIntensity * distanceScale;
        
        // Update target intensity with distance scaling
        if (!isHoveringInSameArea) {
          targetIntensity = scaledBaseIntensity;
        }
      } else {
        // Mouse is not over the globe - fade out and restore cursor
        isMouseOverGlobe = false;
        isHoveringInSameArea = false;
        targetIntensity = 0;
        event.target.style.cursor = 'auto'; // Restore cursor when not over globe
        if (lastHoverState.current) {
          lastHoverState.current = false;
          if (props.onGlobeHoverChange) props.onGlobeHoverChange(false);
        }
      }
      
      // Clean up temporary objects
      sphereGeometry.dispose();
      sphereMaterial.dispose();
    };

    // Mouse leave handler for complete fade out
    const handleMouseLeave = (event) => {
      isMouseOverGlobe = false;
      isHoveringInSameArea = false;
      targetIntensity = 0;
      event.target.style.cursor = 'auto'; // Restore cursor when leaving canvas
      if (lastHoverState.current) {
        lastHoverState.current = false;
        if (props.onGlobeHoverChange) props.onGlobeHoverChange(false);
      }
    };

    // Add Tiles Layer
    const TILE_RES = 1; // degrees
    const landImageUrl = 'https://unpkg.com/three-globe/example/img/earth-water.png';
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = landImageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Optimization for frequent read-back
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const isLand = (lng, lat) => {
        const x = Math.floor(((lng + 180) % 360) * (img.width / 360));
        const y = Math.floor((90 - lat) * (img.height / 180));
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        // Increase threshold to be more inclusive of land (dark) pixels
        return pixelData[0] < 50;
      };

      console.time('tile-generation');
      const landTiles = [];
      let kolkataTile = null; // Store Kolkata tile separately
      const tileHalf = TILE_RES / 2;
      const kolkataLat = 22.57;
      const kolkataLng = 88.36;
      const kolkataTolerance = TILE_RES / 2; // Acceptable range for matching Kolkata tile
      
      for (let lat = 90 - tileHalf; lat > -90; lat -= TILE_RES) {
        // Calculate adaptive longitude step based on latitude
        // At higher latitudes, we use larger longitude steps to maintain visual uniformity
        const latRad = lat * Math.PI / 180;
        const lngStepMultiplier = Math.max(1 / Math.cos(latRad), 1);
        const adaptiveLngStep = TILE_RES * lngStepMultiplier;
        const adaptiveLngHalf = adaptiveLngStep / 2;
        
        // Ensure we don't exceed reasonable bounds near poles
        const maxLngStep = Math.min(adaptiveLngStep, 10); // Cap at 10 degrees
        const actualLngStep = Math.min(maxLngStep, adaptiveLngStep);
        const actualLngHalf = actualLngStep / 2;
        
        for (let lng = -180 + actualLngHalf; lng < 180; lng += actualLngStep) {
          const samples = [
            { lng, lat },
            { lng: lng - actualLngHalf, lat: lat + tileHalf },
            { lng: lng + actualLngHalf, lat: lat + tileHalf },
            { lng: lng - actualLngHalf, lat: lat - tileHalf },
            { lng: lng + actualLngHalf, lat: lat - tileHalf }
          ];
          if (samples.some(p => isLand(p.lng, p.lat))) {
            // Check if this tile is at/near Kolkata
            if (
              Math.abs(lat - kolkataLat) < kolkataTolerance &&
              Math.abs(lng - kolkataLng) < kolkataTolerance
            ) {
              kolkataTile = {
                lat,
                lng,
                lngSize: actualLngStep,
                latSize: TILE_RES
              };
            } else {
              landTiles.push({ 
                lat, 
                lng, 
                lngSize: actualLngStep,
                latSize: TILE_RES 
              });
            }
          }
        }
      }
      console.timeEnd('tile-generation');
      console.log(`Generated ${landTiles.length} tiles.`);

      // Merge geometries for performance
      globeRadius = globe.getGlobeRadius();
      const geometries = [];

      const marginFactor = 0.75;
      for (const { lat, lng, lngSize, latSize } of landTiles) {
        const tileLatSize = latSize * marginFactor;
        const tileLngSize = lngSize * marginFactor;

        // Calculate phi and theta for the tile
        const phiStart = (90 - (lat + tileLatSize / 2)) * Math.PI / 180;
        const phiLength = tileLatSize * Math.PI / 180;
        const thetaStart = (lng - tileLngSize / 2 + 180) * Math.PI / 180;
        const thetaLength = tileLngSize * Math.PI / 180;

        // Adaptive segments based on tile size for better visual quality
        const widthSegments = Math.max(1, Math.ceil(tileLngSize / 2));
        const heightSegments = Math.max(1, Math.ceil(tileLatSize / 2));
        
        const tileGeometry = new THREE.SphereGeometry(
          globeRadius + 0.1,
          widthSegments,
          heightSegments,
          thetaStart,
          thetaLength,
          phiStart,
          phiLength
        );
        geometries.push(tileGeometry);
      }

      if (geometries.length > 0) {
        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
        
        // Back-side mesh - switch to MeshStandardMaterial for better lighting
        const backMaterial = new THREE.MeshStandardMaterial({
          color: '#cccccc',  // Light grey for back side
          side: THREE.BackSide,
          transparent: true,
          opacity: 0.35,
          roughness: 0.7,    // PBR property for realistic surface
          metalness: 0.1     // Slight metallic quality
        });
        backTilesMesh = new THREE.Mesh(mergedGeometry, backMaterial);
        globe.scene().add(backTilesMesh);

        // Front-side mesh - MeshStandardMaterial with optimized PBR properties
        const frontMaterial = new THREE.MeshStandardMaterial({
          color: '#ffffff',  // Pure white for front side
          side: THREE.FrontSide,
          transparent: true,
          opacity: 0.9,
          roughness: 0.3,    // Lower roughness for better light response
          metalness: 0.0,    // Non-metallic for better color response
          emissive: 0x001122, // Subtle blue emissive for depth
          emissiveIntensity: 0.05
        });
        frontTilesMesh = new THREE.Mesh(mergedGeometry, frontMaterial);
        globe.scene().add(frontTilesMesh);

        // --- Add Kolkata tile as a separate red mesh ---
        if (kolkataTile) {
          const marginFactor = 0.75;
          const tileLatSize = kolkataTile.latSize * marginFactor;
          const tileLngSize = kolkataTile.lngSize * marginFactor;
          const phiStart = (90 - (kolkataTile.lat + tileLatSize / 2)) * Math.PI / 180;
          const phiLength = tileLatSize * Math.PI / 180;
          const thetaStart = (kolkataTile.lng - tileLngSize / 2 + 180) * Math.PI / 180;
          const thetaLength = tileLngSize * Math.PI / 180;
          const widthSegments = Math.max(1, Math.ceil(tileLngSize / 2));
          const heightSegments = Math.max(1, Math.ceil(tileLatSize / 2));
          const kolkataGeometry = new THREE.SphereGeometry(
            globeRadius + 0.11, // Slightly above the other tiles
            widthSegments,
            heightSegments,
            thetaStart,
            thetaLength,
            phiStart,
            phiLength
          );
          // Red material for Kolkata (store reference for animation)
          kolkataMaterial = new THREE.MeshStandardMaterial({
            color: '#ff2222', // Bright red
            side: THREE.FrontSide,
            transparent: false,
            roughness: 0.3,
            metalness: 0.0,
            emissive: 0x220000,
            emissiveIntensity: 0.1 // Start value, will animate
          });
          kolkataMesh = new THREE.Mesh(kolkataGeometry, kolkataMaterial);
          globe.scene().add(kolkataMesh);
        }

        // Create light target object
        lightTarget = new THREE.Object3D();
        lightTarget.position.set(0, 0, 0);
        globe.scene().add(lightTarget);

        // Create optimized yellow spotlight with distance-based intensity
        hoverLight = new THREE.SpotLight(
          0xfcf4de,    // Bright golden yellow (more contrasting)
          0,           // Start with 0 intensity (will fade in on hover)
          50,          // Increased distance for better reach
          Math.PI / 5, // Slightly tighter beam (36 degrees) for focus
          0.7,         // Good penumbra for soft but defined edges
          2            // Realistic decay (inverse square law)
        );
        hoverLight.position.set(0, 0, globeRadius + 20); // Closer for more intensity
        hoverLight.target = lightTarget;
        globe.scene().add(hoverLight);
        globe.scene().add(hoverLight.target);

        // Initialize position vectors for smooth interpolation
        const initialLightPos = new THREE.Vector3(0, 0, globeRadius + 20); // Match closer distance
        const initialTargetPos = new THREE.Vector3(0, 0, globeRadius);
        targetLightPosition.copy(initialLightPos);
        currentLightPosition.copy(initialLightPos);
        targetPosition.copy(initialTargetPos);
        currentPosition.copy(initialTargetPos);

        // Set position tolerance relative to globe size
        positionTolerance = globeRadius * 0.1; // 10% of globe radius
        console.log('Position tolerance set to:', positionTolerance, 'Globe radius:', globeRadius);

        // Multi-light strategy for better balance
        
        // 1. Low ambient light for base visibility
        const ambientLight = new THREE.AmbientLight(0x404080, 3); // Cool blue, very low
        globe.scene().add(ambientLight);

        // 2. Camera-following directional light (sunlight from user's perspective)
        const directionalLight = new THREE.DirectionalLight(0xaabbcc, 4); // Cooler, dimmer light
        // Position will be updated dynamically based on camera
        directionalLight.target.position.set(0, 0, 0); // Always point at globe center
        globe.scene().add(directionalLight);
        globe.scene().add(directionalLight.target);

        // Function to update directional light position based on camera
        const updateSunlight = () => {
          const camera = globe.camera();
          const cameraPosition = camera.position.clone();
          
          // Position sunlight to come from camera direction
          const lightDistance = globeRadius * 3; // Distance from globe center
          const lightPosition = cameraPosition.clone().normalize().multiplyScalar(lightDistance);
          directionalLight.position.copy(lightPosition);
          
          // Ensure target is at globe center
          directionalLight.target.position.set(0, 0, 0);
          directionalLight.target.updateMatrixWorld(true);
        };

        // Initial sunlight setup
        updateSunlight();

        // Set globe to use our custom lights (removes default camera-following light)
        globe.lights([ambientLight, directionalLight, hoverLight]);

        console.log('Optimized PBR lighting system initialized - Spotlight intensity range:', baseIntensity, 'to', maxBoostedIntensity);
        console.log('Camera-following sunlight enabled - light will track user rotation');
        console.log('High-contrast hover spotlight ready - should be clearly visible now!');
        console.log('Cursor will hide when hovering over globe for immersive experience');

        // Add mouse move listener to the canvas
        const canvas = globe.renderer().domElement;
        canvas.style.cursor = 'auto'; // Set initial cursor style
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        
        // Animation loop for smooth intensity and position transitions
        const animateLight = () => {
          // Smooth rotation
          const lngDiff = targetLng - currentLng;
          if (Math.abs(lngDiff) > 0.01) {
            currentLng += lngDiff * rotationSmoothness;
            globe.pointOfView({ lng: currentLng }, 0); // lng is updated, lat/alt are maintained
          }

          // Update sunlight to follow camera rotation
          updateSunlight();
          
          if (hoverLight && lightTarget) {
            // Calculate dynamic intensity based on hover duration with distance scaling
            if (isHoveringInSameArea && isMouseOverGlobe) {
              const hoverDuration = (Date.now() - hoverStartTime) / 1000; // Convert to seconds
              const buildupProgress = Math.min(hoverDuration / hoverBuildupSpeed, 1); // 0 to 1
              
              // Get current distance scaling
              const currentDistance = currentPosition.length();
              const distanceScale = Math.max(0.8, Math.min(1.2, globeRadius / currentDistance));
              const scaledBaseIntensity = baseIntensity * distanceScale;
              const scaledMaxIntensity = maxBoostedIntensity * distanceScale;
              
              const intensityBoost = buildupProgress * (scaledMaxIntensity - scaledBaseIntensity);
              const newTargetIntensity = scaledBaseIntensity + intensityBoost;
              
              // Debug: log intensity buildup occasionally
              if (Math.floor(hoverDuration * 1) % 2 === 0 && hoverDuration > 0.3) {
                console.log(`Hover: ${hoverDuration.toFixed(1)}s, Progress: ${(buildupProgress * 100).toFixed(0)}%, Intensity: ${newTargetIntensity.toFixed(0)} (scale: ${distanceScale.toFixed(2)})`);
              }
              
              targetIntensity = newTargetIntensity;
            }
            
            // Smooth intensity interpolation
            const intensityDiff = targetIntensity - currentIntensity;
            currentIntensity += intensityDiff * fadeSpeed;
            hoverLight.intensity = currentIntensity;
            
            // Smooth position interpolation
            currentLightPosition.lerp(targetLightPosition, positionSmoothness);
            currentPosition.lerp(targetPosition, positionSmoothness);
            
            // Apply smoothed positions
            hoverLight.position.copy(currentLightPosition);
            lightTarget.position.copy(currentPosition);
            lightTarget.updateMatrixWorld(true);
            
            // Ensure spotlight direction updates (fix for Three.js spotlight target bug)
            hoverLight.target.updateMatrixWorld(true);
            hoverLight.updateMatrixWorld(true);
            
            // Stop animating when very close to targets (avoids infinite tiny updates)
            if (Math.abs(intensityDiff) < 0.1) {
              currentIntensity = targetIntensity;
              hoverLight.intensity = currentIntensity;
            }
          }

          // --- Animate Kolkata tile pulse ---
          if (kolkataMaterial) {
            // Pulse between 0.1 and 1.2 emissiveIntensity
            const t = Date.now() * 0.002; // Speed of pulse
            kolkataMaterial.emissiveIntensity = 0.65 + 0.55 * Math.sin(t * 2 * Math.PI * 0.5); // 0.5 Hz
          }

          animationFrameId = requestAnimationFrame(animateLight);
        };

        // Start animation loop
        animateLight();
      }
    };

    // Cleanup function
    return () => {
      const canvas = globe.renderer().domElement;
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('wheel', handleWheel);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return <div ref={globeRef} style={{ width: '100%', height: '100%' }} />;
});

export default Globe; 