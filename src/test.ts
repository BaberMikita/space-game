function onPointerDown( event ) {

  pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

  raycaster.setFromCamera( pointer, camera );

  const intersects = raycaster.intersectObjects( objects, false );

  if ( intersects.length > 0 ) {

    const intersect = intersects[ 0 ];

    // delete cube

    if ( isShiftDown ) {

      if ( intersect.object !== plane ) {

        scene.remove( intersect.object );

        objects.splice( objects.indexOf( intersect.object ), 1 );

      }

      // create cube

    } else {

      const voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
      voxel.position.copy( intersect.point ).add( intersect.face.normal );
      voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
      scene.add( voxel );

      objects.push( voxel );

    }

    render();

  }
}